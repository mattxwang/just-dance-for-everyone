import type { NormalizedLandmark, NormalizedLandmarkList } from '@mediapipe/pose'
import { POSE_LANDMARKS } from '@mediapipe/pose'
import dance1 from './dance_1.json'
import dance2 from './dance_2.json'
import dance3 from './dance_3.json'
import dance4 from './dance_4.json'
import dance5 from './dance_5.json'
import dance6 from './dance_6.json'
import dance7 from './dance_7.json'
import dance8 from './dance_8.json'
export interface Dance {
  indices: number[]
  keyframes: NormalizedLandmarkList[]
  originalFps: number
  beatsInDance: number
  danceBpm: number
  videoUrl: string
  totalFrames: number
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const genScaledDanceMove = ({ dance, beatsInDance, repeatedLoopLength, videoUrl }: { dance: any, beatsInDance: number, repeatedLoopLength: number, videoUrl: string }): Dance => {
  return {
    indices: dance.indices,
    // TODO: better types for this function
    keyframes: dance.keyframes.map((frame: Record<PythonLandmarkKeys, NormalizedLandmark>) => scaleLandmarks(keyedToOrderedKeyframes(frame), 1.3, 1.3, 0, -0.2)), // this is an arbitrary scale
    originalFps: 30,
    beatsInDance,
    danceBpm: 60 * beatsInDance / repeatedLoopLength,
    videoUrl,
    totalFrames: repeatedLoopLength * 30
  }
}

const DANCES: Dance[] = [
  { dance: dance1, beatsInDance: 4, repeatedLoopLength: 3.09, videoUrl: 'dance_1.mp4' },
  { dance: dance2, beatsInDance: 4, repeatedLoopLength: 3.23, videoUrl: 'dance_2.mp4' },
  { dance: dance3, beatsInDance: 4, repeatedLoopLength: 2.95, videoUrl: 'dance_3.mp4' },
  { dance: dance4, beatsInDance: 4, repeatedLoopLength: 2.40, videoUrl: 'dance_4.mp4' },
  { dance: dance5, beatsInDance: 8, repeatedLoopLength: 8.74, videoUrl: 'dance_5.mp4' }, // TODO: too many keyframes
  { dance: dance6, beatsInDance: 4, repeatedLoopLength: 3.02, videoUrl: 'dance_6.mp4' }, // TODO: too many keyframes
  { dance: dance7, beatsInDance: 4, repeatedLoopLength: 3.02, videoUrl: 'dance_7.mp4' },
  { dance: dance8, beatsInDance: 2, repeatedLoopLength: 1.15, videoUrl: 'dance_8.mp4' }
].map(genScaledDanceMove)

export default DANCES
