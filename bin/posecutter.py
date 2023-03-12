import cv2
import os
import json
import mediapipe as mp
import numpy as np

directory = '../public/videos'
new_fw = 1920*(2/3)
new_fh = 1080*(2/3)
lower_w = int((1920 - new_fw))
upper_w = 1920 - lower_w
lower_h = int((1080 - new_fh)/2)
upper_h = 1080 - lower_h
lower_h = lower_h*2

print(new_fw)
print(new_fh)
print(lower_w)
print(upper_w)
print(lower_h)
print(upper_h)

for filename in os.listdir(directory):
    keypoint_fname = os.path.splitext(filename)[0] + "_keypoints.json"
    keypoint_dname = '../public/dance_moves' + "_keypoints"
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
            # initialize mediapipe
            image_path = keypoint_dname + '_frames/' + os.path.splitext(keypoint_fname)[0]  + '/keypoint' + str(impt_keypoints[ind])[:-1] + '.jpg'
            if os.path.exists(image_path):
                os.remove(image_path)
            cv2.imwrite(image_path, image[lower_h:upper_h, lower_w:upper_w])
            ind += 1
        count += 1