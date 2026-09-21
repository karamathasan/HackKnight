from flask import Flask, jsonify, request, render_template
import cv2
import numpy as np
import mediapipe as mp
import base64
import os
import time
from flask_cors import CORS
import keyboard

app = Flask(__name__)
CORS(app)

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, model_complexity=0, min_detection_confidence=0.5)

current_gesture = 'none'

DEBUG = bool(os.environ.get("HANDSY_DEBUG"))  # set HANDSY_DEBUG=1 to print finger ratios
FINGERS = ((8, 6), (12, 10), (16, 14), (20, 18))  # (tip, pip) landmarks: index, middle, ring, pinky
EXTENDED_RATIO = 1.1     # finger counts as extended when tip is this much farther from the wrist than its pip joint
PAUSE_HOLD_FRAMES = 2    # consecutive open-palm frames needed before pausing
PAUSE_COOLDOWN = 1.5     # seconds before pause can fire again
open_frames = 0
last_pause = 0.0

def lmsLen(i,j,lms):
    len = np.linalg.norm(np.array([lms[i].x-lms[j].x,lms[i].y-lms[j].y]))
    return len

def ptDist(i,j,lms,w,h):
    # landmarks are normalized to the frame, so scale back to pixels or 4:3 frames distort distances
    return np.hypot((lms[i].x-lms[j].x)*w, (lms[i].y-lms[j].y)*h)

def open_palm(lms,w,h):
    # A finger is extended when its tip is clearly farther from the wrist than its middle joint.
    # That comparison doesn't depend on hand size, distance from the camera, or rotation.
    ratios = [ptDist(tip,0,lms,w,h) / ptDist(pip,0,lms,w,h) for tip,pip in FINGERS]
    if DEBUG:
        print("finger ratios", [round(r,2) for r in ratios])
    return all(r > EXTENDED_RATIO for r in ratios)

def check_gesture(lms,w,h):
    global current_gesture, open_frames, last_pause
    pointer = lmsLen(8,5,lms)
    middle = lmsLen(12,9,lms)
    ring = lmsLen(16,13,lms)
    pinky = lmsLen(20,17,lms)

    if open_palm(lms,w,h):
        open_frames += 1
        now = time.time()
        # fire once when the palm has been held up, not on every frame while it stays up
        if open_frames == PAUSE_HOLD_FRAMES and now - last_pause > PAUSE_COOLDOWN:
            keyboard.press('space')
            keyboard.release('space')
            last_pause = now
            print("pause gesture -> space")
        current_gesture = "pause"
        return "pause"
    open_frames = 0

    middlescore = (middle - (pointer + middle + ring + pinky)/3.5)/middle
    if middlescore < 0.8:
        # keyboard.press('alt')
        # keyboard.press('f4')
        current_gesture = "f"
        return "f"
    
    current_gesture = "none"
    return "none"

@app.route('/hands', methods = ['POST'])
def returnHands():
    global current_gesture, open_frames
    pxbytes = request.data
    pxarr = np.frombuffer(pxbytes,np.uint8)
    frame = cv2.imdecode(pxarr, cv2.IMREAD_COLOR)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    h, w = frame.shape[:2]

    result = hands.process(frame_rgb)

    res = "none"
    if result.multi_hand_landmarks:
        res = check_gesture(result.multi_hand_landmarks[0].landmark, w, h)
        #     landmarks = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand_landmarks.landmark]
        #     hands_data.append(landmarks)
        # overlay
    else:
        open_frames = 0
    # "hand" lets the client drop to a slow poll rate while nobody is gesturing
    hand = bool(result.multi_hand_landmarks)
    if current_gesture != res:
        return jsonify({
            "gesture":res,
            "overlay":"none",
            "hand":hand
        })
    else:
        return jsonify({
            "gesture":"none",
            "overlay":"none",
            "hand":hand
        })

@app.route('/test',methods=['POST'])
def test():
    print(request.get_json())
    return jsonify({"message":"received request"})

if __name__ == "__main__":
    app.run(host='0.0.0.0',port='5000')
    # socketio.run(app, host="0.0.0.0", port=3000, debug=True)




