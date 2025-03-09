from flask import Flask, jsonify, request, render_template
import cv2
import numpy as np
import mediapipe as mp
import base64
from flask_cors import CORS
import keyboard

app = Flask(__name__)
CORS(app)

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)

current_gesture = 'none'

def lmsLen(i,j,lms):
    len = np.linalg.norm(np.array([lms[i].x-lms[j].x,lms[i].y-lms[j].y]))
    return len

def check_gesture(lms):
    global current_gesture
    pointer = lmsLen(8,5,lms)
    middle = lmsLen(12,9,lms)
    ring = lmsLen(16,13,lms)
    pinky = lmsLen(20,17,lms)
    palm = lmsLen(17,0,lms)

    avg = (pointer + middle + ring + pinky)/4
    if abs((palm - avg)/palm) < 0.2:
        keyboard.press('space')
        keyboard.release('space')
        current_gesture = "pause"
        return "pause"
    
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
    global current_gesture
    pxbytes = request.data
    pxarr = np.frombuffer(pxbytes,np.uint8)
    frame = cv2.imdecode(pxarr, cv2.IMREAD_COLOR)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame_rgb = frame
    
    result = hands.process(frame_rgb)

    res = "none"
    if result.multi_hand_landmarks:
        res = check_gesture(result.multi_hand_landmarks[0].landmark)
        #     landmarks = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand_landmarks.landmark]
        #     hands_data.append(landmarks)
        # overlay
    if current_gesture != res:
        return jsonify({
            "gesture":res,
            "overlay":"none"
        })
    else:
        return jsonify({
            "gesture":"none",
            "overlay":"none"
        })

@app.route('/test',methods=['POST'])
def test():
    print(request.get_json())
    return jsonify({"message":"received request"})

if __name__ == "__main__":
    app.run(host='0.0.0.0',port='5000')
    # socketio.run(app, host="0.0.0.0", port=3000, debug=True)




