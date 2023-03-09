import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import type { NormalizedLandmarkList } from '@mediapipe/pose'
import { Pose, POSE_CONNECTIONS, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_NEUTRAL, POSE_LANDMARKS_RIGHT } from '@mediapipe/pose'

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
