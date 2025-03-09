from flask import Flask, jsonify, request, render_template
import cv2
import numpy as np
import mediapipe as mp
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)

def check_gesture():
    pass

latestimg = None

@app.route('/hands', methods = ['POST'])
def returnHands():
    pxbytes = request.data
    pxarr = np.frombuffer(pxbytes,np.uint8)
    print(pxarr)
    frame = cv2.imdecode(pxarr, cv2.IMREAD_COLOR)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame_rgb = frame
    cv2.imwrite("frame.jpg", frame)
    
    result = hands.process(frame_rgb)

    hands_data = []
    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            landmarks = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand_landmarks.landmark]
            hands_data.append(landmarks)

    return jsonify({"landmarks":hands_data})

# @socketio.on("message")
@app.route('/test',methods=['POST'])
def test():
    print(request.get_json())
    return jsonify({"message":"received request"})

# @app.route("/",methods=['GET'])
# def page():

if __name__ == "__main__":
    app.run(host='0.0.0.0',port='5000')
    # socketio.run(app, host="0.0.0.0", port=3000, debug=True)




