import { POSE_LANDMARKS } from '@mediapipe/pose'
import type { NormalizedLandmark, NormalizedLandmarkList } from '@mediapipe/pose'
import { IMPORTANT_LANDMARKS } from '../dances/dances'
import { getPoseLandmarkIndexByKey } from './mp'

/**
 * convex "smoothing" to reward good dances :)
 * @param rawScore invariant: Math.abs(rawScore) < max
 * @param max positive max
 * @returns num between 0 and 100
 */
export function normalizeScore (rawScore: number, max: number): number {
  // arbitrarily convex curve
  return Math.pow((Math.abs(max - Math.abs(rawScore)) / max), 1.5) * 120
}

/**
 * letter grade for score
 * @param score nonnegative score
 */
export function grade (score: number): string {
  if (score > 80) {
    return 'amazing!!'
  }
  if (score > 70) {
    return 'great job!'
  }
  if (score > 60) {
    return 'good job!'
  }
  if (score > 50) {
    return 'good effort!'
  }
  return 'nice try!'
}

export function xyAngleRad (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
  return Math.asin((l1.y - l2.y) / cartesianDistance(l1, l2))
}

export function xyAngleDeg (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
  return xyAngleRad(l1, l2) * 180 / Math.PI
}

export function cartesianDistance (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
  // TODO: actually fix this
  if (l1 === undefined || l2 === undefined) return 0
  return Math.sqrt(
    (l1.x - l2.x) ** 2 +
    (l1.y - l2.y) ** 2 +
    (l1.z - l2.z) ** 2
  )
}

export function cartesianDistanceXY (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
  // TODO: actually fix this
  if (l1 === undefined || l2 === undefined) return 0
  return Math.sqrt(
    (l1.x - l2.x) ** 2 +
    (l1.y - l2.y) ** 2
  )
}

export function diffPosesSubsetXY (inputPose: NormalizedLandmarkList, referencePose: NormalizedLandmarkList): number {
  return Array.from(IMPORTANT_LANDMARKS.keys()).map(key => {
    if (!(key in POSE_LANDMARKS)) return 0
    const index = getPoseLandmarkIndexByKey(key)
    return cartesianDistanceXY(inputPose[index], referencePose[index])
  }).reduce((p, c) => p + c, 0) / IMPORTANT_LANDMARKS.size
}
