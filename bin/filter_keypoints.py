import json

def load_dance_keypoints(filename):
  data = open(f'../public/dance_moves_keypoints/{filename}')
  return json.load(data)

if __name__ == "__main__":
  dance = load_dance_keypoints('dance_4_keypoints.json')

  keyframes = []
  for index in dance['impt_keypoints']:
    keyframes.append(dance["frames"][int(index)])

  with open('out.json', 'w') as f:
    json.dump({'indices': dance['impt_keypoints'], 'keyframes': keyframes}, f, indent=2)
