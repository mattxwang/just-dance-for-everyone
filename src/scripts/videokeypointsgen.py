import cv2
import mediapipe as mp
import numpy as np
import sys
import os
import json
directory = '../dance_moves'

mp_holistic = mp.solutions.holistic

index_to_pose = {
    0: 'NOSE',
    1: 'LEFT_EYE_INNER',
    2: 'LEFT_EYE', 
    3: 'LEFT_EYE_OUTER', 
    4: 'RIGHT_EYE_INNER', 
    5: 'RIGHT_EYE', 
    6: 'RIGHT_EYE_OUTER',
    7: 'LEFT_EAR',
    8: 'RIGHT_EAR',
    9: 'MOUTH_LEFT',
    10: 'MOUTH_RIGHT',
    11: 'LEFT_SHOULDER',
    12: 'RIGHT_SHOULDER', 
    13: 'LEFT_ELBOW', 
    14: 'RIGHT_ELBOW',
    15: 'LEFT_WRIST',
    16: 'RIGHT_WRIST',
    17: 'LEFT_PINKY',
    18: 'RIGHT_PINKY',
    19: 'LEFT_INDEX',
    20: 'RIGHT_INDEX',
    21: 'LEFT_THUMB',
    22: 'RIGHT_THUMB',
    23: 'LEFT_HIP',
    24: 'RIGHT_HIP',
    25: 'LEFT_KNEE',
    26: 'RIGHT_KNEWW',
    27: 'LEFT_ANKLE',
    28: 'RIGHT_ANKLE',
    29: 'LEFT_HEEL',
    30: 'RIGHT_HEEL',
    31: 'LEFT_FOOT_INDEX',
    32: 'RIGHT_FOOT_INDEX'
}

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose 
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) 
index_to_pose_keys = index_to_pose.keys()
#print(pose) 
for filename in os.listdir(directory):
    keypoint_fname = os.path.splitext(filename)[0] + "_keypoints.json"
    keypoint_dname = directory + "_keypoints"
    f = os.path.join(directory, filename)
    k = os.path.join(keypoint_dname, keypoint_fname)
    if os.path.exists(k):
        os.remove(k)
    if not os.path.isfile(f):
        print("Error finding video stream or file")
        raise TypeError
    g = open(k, "x")
    cap = cv2.VideoCapture(f)
    if cap.isOpened() == False:
        print("Error opening video stream or file")
        raise TypeError
    dance_frames = []
    while cap.isOpened():
        ret, image = cap.read()
        if not ret:
            break
        image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)         
        image.flags.writeable = False
        results = pose.process(image)
        frame = {}
        for key in index_to_pose_keys: 
            p = index_to_pose[key]
            pose_value = results.pose_landmarks.landmark[key]
            frame[p] = {'x': pose_value.x, 'y': pose_value.y, 'z': pose_value.y, 'visibility': pose_value.visibility}
        dance_frames.append(frame)
    g.write(json.dumps(dance_frames))
    g.close()
    cap.release()
pose.close()

