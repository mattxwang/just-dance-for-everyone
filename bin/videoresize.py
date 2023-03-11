import cv2
import mediapipe as mp
import numpy as np
import sys
import os
import json
directory = '../public/videos'

mp_holistic = mp.solutions.holistic

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose 
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) 
#print(pose) 
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
for filename in os.listdir(directory):
    f = os.path.join(directory, filename)
    cap = cv2.VideoCapture(f)
    if cap.isOpened() == False:
        print("Error opening video stream or file")
        raise TypeError
    frame_width = int(cap.get(3))
    frame_height = int(cap.get(4))
    new_fw = int(frame_width * (2/3))
    new_fh = int(frame_height * (2/3))
    #outdir, inputflnm = sys.argv[1][:sys.argv[1].rfind('/')+1], sys.argv[1][sys.argv[1].rfind('/')+1:]
    #inflnm, inflext = inputflnm.split('.')
    out_filename = '../public/dance_moves/' + filename
    if os.path.exists(out_filename):
        os.remove(out_filename)
    out = cv2.VideoWriter(out_filename, fourcc, 10, (new_fw, new_fh))
    while cap.isOpened():
        ret, image = cap.read()
        if not ret:
            break
        image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)         
        image.flags.writeable = False
        results = pose.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)   
        height = int(image.shape[1])
        width = int(image.shape[2])
        ho = int((height - new_fh)/2)
        wo = int((width - new_fw)/2)
        mp_drawing.draw_landmarks(image[ho:(height-ho), wo:(width-wo)], results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
        out.write(image)
    out.release()
pose.close()
cap.release()


