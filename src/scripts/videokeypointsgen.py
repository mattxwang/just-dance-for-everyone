import cv2
import mediapipe as mp
import numpy as np
import sys
import os
directory = '../dance_moves'

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose 
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) 
#print(pose) 
for filename in os.listdir(directory):
    keypoint_fname = os.path.splitext(filename)[0] + "_keypoints.txt"
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
    while cap.isOpened():
        ret, image = cap.read()
        if not ret:
            break
        image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)         
        image.flags.writeable = False
        results = pose.process(image)
        g.write(str(results.pose_landmarks))
    g.close()
    cap.release()
pose.close()

