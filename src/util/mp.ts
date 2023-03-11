import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import type { NormalizedLandmarkList } from '@mediapipe/pose'
import { Pose, POSE_CONNECTIONS, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_NEUTRAL, POSE_LANDMARKS_RIGHT, POSE_LANDMARKS } from '@mediapipe/pose'
import type { PythonLandmarkKeys } from '../dances/dances'
import { IMPORTANT_LANDMARKS } from '../dances/dances'

export const createPose = (): Pose => {
  const pose = new Pose({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    }
  })

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })

  return pose
}

export const startCamera = (pose: Pose | null, videoElement: HTMLVideoElement): void => {
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      if (pose === null) return
      await pose.send({ image: videoElement })
    },
    width: 1280,
    height: 720
  })
  void camera.start()
}

export const drawAllLandmarks = (canvasCtx: CanvasRenderingContext2D, poseLandmarks: NormalizedLandmarkList): void => {
  drawConnectors(
    canvasCtx, poseLandmarks, POSE_CONNECTIONS,
    { visibilityMin: 0.65, color: 'white' })
  drawLandmarks(
    canvasCtx,
    Object.values(POSE_LANDMARKS_LEFT)
      .map(index => poseLandmarks[index]),
    { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)' })
  drawLandmarks(
    canvasCtx,
    Object.values(POSE_LANDMARKS_RIGHT)
      .map(index => poseLandmarks[index]),
    { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)' })
  drawLandmarks(
    canvasCtx,
    Object.values(POSE_LANDMARKS_NEUTRAL)
      .map(index => poseLandmarks[index]),
    { visibilityMin: 0.65, color: 'white', fillColor: 'black' })
}

export const drawImportantLandmarks = (canvasCtx: CanvasRenderingContext2D, poseLandmarks: NormalizedLandmarkList): void => {
  drawConnectors(
    canvasCtx, poseLandmarks, POSE_CONNECTIONS,
    { visibilityMin: 0.65, color: 'white' })
  drawLandmarks(
    canvasCtx,
    Object.keys(POSE_LANDMARKS_LEFT)
      // @ts-expect-error TODO: fix index types
      .filter(index => IMPORTANT_LANDMARKS.has(index))
      // @ts-expect-error TODO: fix index types
      .map(index => POSE_LANDMARKS_LEFT[index])
      .map(index => poseLandmarks[index]),
    { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)' })
  drawLandmarks(
    canvasCtx,
    Object.keys(POSE_LANDMARKS_RIGHT)
      // @ts-expect-error TODO: fix index types
      .filter(index => IMPORTANT_LANDMARKS.has(index))
      // @ts-expect-error TODO: fix index types
      .map(index => POSE_LANDMARKS_RIGHT[index])
      .map(index => poseLandmarks[index]),
    { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)' })
  drawLandmarks(
    canvasCtx,
    Object.keys(POSE_LANDMARKS_NEUTRAL)
      // @ts-expect-error TODO: fix index types
      .filter(index => IMPORTANT_LANDMARKS.has(index))
      // @ts-expect-error TODO: fix index types
      .map(index => POSE_LANDMARKS_NEUTRAL[index])
      .map(index => poseLandmarks[index]),
    { visibilityMin: 0.65, color: 'white', fillColor: 'black' })
}

export const getPoseLandmarkIndexByKey = (key: PythonLandmarkKeys): number => {
  if (key in POSE_LANDMARKS_LEFT) {
    // @ts-expect-error TODO: fix index types
    return POSE_LANDMARKS_LEFT[key]
  }
  if (key in POSE_LANDMARKS_RIGHT) {
    // @ts-expect-error TODO: fix index types
    return POSE_LANDMARKS_RIGHT[key]
  }
  // @ts-expect-error TODO: fix index types
  return POSE_LANDMARKS[key]
}
