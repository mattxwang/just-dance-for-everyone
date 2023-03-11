import type { NormalizedLandmarkList } from '@mediapipe/pose'
import { POSE_LANDMARKS } from '@mediapipe/pose'
import dance2 from './dance_2.json'

export interface Dance {
  indices: number[]
  keyframes: NormalizedLandmarkList[]
  originalFps: number
  beatsPerSecond: number
}

function keyedToOrderedKeyframes(keyframe): NormalizedLandmarkList {
  const arr = Array(25)
  for (const [key, value] of Object.entries(POSE_LANDMARKS)) {
    arr[value] = keyframe[key]
  }
  return arr
}

// export enum POSE_KEYS = Object.keys()

const DANCES = [
  {
    indices: dance2.indices,
    keyframes: dance2.keyframes.map(frame => keyedToOrderedKeyframes(frame)),
    originalFps: 30,
    beatsPerSecond: 1
  }
]

export default DANCES
