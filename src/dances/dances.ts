import type { NormalizedLandmark, NormalizedLandmarkList } from '@mediapipe/pose'
import { POSE_LANDMARKS } from '@mediapipe/pose'
import dance2 from './dance_2.json'

export interface Dance {
  indices: number[]
  keyframes: NormalizedLandmarkList[]
  originalFps: number
  beatsInDance: number
}

export type PythonLandmarkKeys =
  'NOSE' |
  'LEFT_EYE_INNER' |
  'LEFT_EYE' |
  'LEFT_EYE_OUTER' |
  'RIGHT_EYE_INNER' |
  'RIGHT_EYE' |
  'RIGHT_EYE_OUTER' |
  'LEFT_EAR' |
  'RIGHT_EAR' |
  'MOUTH_LEFT' |
  'MOUTH_RIGHT' |
  'LEFT_SHOULDER' |
  'RIGHT_SHOULDER' |
  'LEFT_ELBOW' |
  'RIGHT_ELBOW' |
  'LEFT_WRIST' |
  'RIGHT_WRIST' |
  'LEFT_PINKY' |
  'RIGHT_PINKY' |
  'LEFT_INDEX' |
  'RIGHT_INDEX' |
  'LEFT_THUMB' |
  'RIGHT_THUMB' |
  'LEFT_HIP' |
  'RIGHT_HIP' |
  'LEFT_KNEE' |
  'RIGHT_KNEE' |
  'LEFT_ANKLE' |
  'RIGHT_ANKLE' |
  'LEFT_HEEL' |
  'RIGHT_HEEL' |
  'LEFT_FOOT_INDEX' |
  'RIGHT_FOOT_INDEX'

export const IMPORTANT_LANDMARKS = new Set<PythonLandmarkKeys>([
  // 'NOSE',
  'LEFT_SHOULDER',
  'RIGHT_SHOULDER',
  'LEFT_ELBOW',
  'RIGHT_ELBOW',
  'LEFT_WRIST',
  'RIGHT_WRIST',
  'LEFT_HIP',
  'RIGHT_HIP',
  'LEFT_KNEE',
  'RIGHT_KNEE',
  'LEFT_HEEL',
  'RIGHT_HEEL'
])

function keyedToOrderedKeyframes (keyframe: Record<PythonLandmarkKeys, NormalizedLandmark>): NormalizedLandmarkList {
  const arr: NormalizedLandmarkList = Array(25)
  for (const [key, value] of Object.entries(POSE_LANDMARKS)) {
    // TODO: better types for this function
    arr[value] = keyframe[key as unknown as PythonLandmarkKeys]
  }
  return arr
}

function scaleLandmarks (landmarks: NormalizedLandmarkList, xscale: number, yscale: number, xtransform: number, ytransform: number): NormalizedLandmarkList {
  return landmarks.map(landmark => {
    // note: their type is broken :(
    if (landmark === undefined) return undefined as unknown as NormalizedLandmark
    return {
      x: (landmark.x - 0.5) * xscale + 0.5 + xtransform,
      y: (landmark.y - 0.5) * yscale + 0.5 + ytransform,
      z: landmark.z,
      visibility: landmark.visibility
    }
  })
}

const DANCES: Dance[] = [
  {
    indices: dance2.indices,
    // TODO: better types for this function
    keyframes: dance2.keyframes.map(frame => scaleLandmarks(keyedToOrderedKeyframes(frame as unknown as Record<PythonLandmarkKeys, NormalizedLandmark>), 1.6, 1.8, 0, -0.2)),
    originalFps: 30,
    beatsInDance: 4
  }
]

export default DANCES
