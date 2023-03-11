import cv2
import os
import json
import mediapipe as mp
import numpy as np

directory = '../public/dance_moves'
oname = '../dance_moves'
for filename in os.listdir(directory):
    keypoint_fname = os.path.splitext(filename)[0] + "_keypoints.json"
    keypoint_dname = directory + "_keypoints"
    f = os.path.join(directory, filename)
    count = 0.0
    ind = 0
    cap = cv2.VideoCapture(f)
    if cap.isOpened() == False:
        print("Error opening video stream or file")
        raise TypeError
    keypoint_path = keypoint_dname + '/' + keypoint_fname
    m = open(keypoint_path)
    poses = json.load(m)
    impt_keypoints = poses["impt_keypoints"]
    while cap.isOpened():
        ret, image = cap.read()
        if not ret: 
            break
        if ind == len(impt_keypoints):
            continue
        if count == impt_keypoints[ind]:
            print(image.shape)
            # initialize mediapipe
            image_path = keypoint_dname + '_frames/' + os.path.splitext(keypoint_fname)[0]  + '/keypoint' + str(impt_keypoints[ind])[:-1] + '.jpg'
            if os.path.exists(image_path):
                os.remove(image_path)
            cv2.imwrite(image_path, image)
            ind += 1
        count += 1