from flask import Flask, request, jsonify
import cv2
import numpy as np
import mediapipe as mp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/test',methods=['GET'])
def test():
    return jsonify({"message":"test"})

# @app.route('/process_frame', methods=['POST'])
# def process_frame():
#     try:
#         file = request.files['image']
#         img_bytes = file.read()
#         np_arr = np.frombuffer(img_bytes, np.uint8)
#         frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
#         # Convert image to RGB for MediaPipe
#         frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         result = hands.process(frame_rgb)
        
#         # Extract hand landmarks
#         hands_data = []
#         if result.multi_hand_landmarks:
#             for hand_landmarks in result.multi_hand_landmarks:
#                 landmarks = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand_landmarks.landmark]
#                 hands_data.append(landmarks)

#         return jsonify({"hands": hands_data})
    
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
