import json 
import os 
import numpy as np
import sys
import random
import datetime
import time


songs = []
attempts = []

def gen_songs(): 
    for i in range(60):
        song_name = 'song' + str(i)
        bpm = random.randint(100, 170)
        length = random.randint(120, 180)
        song = {'name': song_name, 'bpm': bpm, 'length': length}
        songs.append(song)

#want couple months worth of data
def gen_attempts(): 
    for i in range(223):
        month = np.random.choice([1, 2, 3],1, p=[.2, .3, .5])[0]
        day = random.randint(1,31)
        if month == 2 and day > 28: 
            continue
        date_time = datetime.datetime(2023, month, day)
        timestamp = time.mktime(date_time.timetuple())
        song = songs[random.randint(0, 59)]
        grade = random.randint(0,100)
        attempt = {'id': i, 'timestamp':timestamp, 'song': song, 'grade': grade, 'month': str(month), 'day': day}
        attempts.append(attempt)

def user_gen(): 
    k = '../public/user.json'
    if os.path.exists(k):
        os.remove(k)
    g = open(k, "x")
    user_json = {'user': 'arjun', 'attempts': attempts}
    g.write(json.dumps(user_json))
    g.close()
gen_songs()
gen_attempts()
user_gen()
