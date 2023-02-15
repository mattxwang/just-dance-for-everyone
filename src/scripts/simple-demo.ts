import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose'
import type { Results } from '@mediapipe/pose'
// this import breaks the code
// import {LandmarkGrid, MeshViewer} from '@mediapipe/control_utils_3d'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'

export default function simpleDemo (): void {
  const videoElement = document.getElementsByClassName('input_video')[0] as HTMLVideoElement
  const canvasElement = document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement
  const canvasCtx = canvasElement.getContext('2d') as CanvasRenderingContext2D
  const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0] as HTMLDivElement
  const grid = new LandmarkGrid(landmarkContainer)

  function onResults (results: Results): void {
    if (results.poseLandmarks === null || results.poseLandmarks === undefined) {
      grid.updateLandmarks([])
      return
    }

    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasCtx.drawImage(results.segmentationMask, 0, 0,
      canvasElement.width, canvasElement.height)

    // Only overwrite existing pixels.
    canvasCtx.globalCompositeOperation = 'source-in'
    canvasCtx.fillStyle = '#00FF00'
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height)

    // Only overwrite missing pixels.
    canvasCtx.globalCompositeOperation = 'destination-atop'
    canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height)

    canvasCtx.globalCompositeOperation = 'source-over'
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
      { color: '#00FF00', lineWidth: 4 })
    drawLandmarks(canvasCtx, results.poseLandmarks,
      { color: '#FF0000', lineWidth: 2 })
    canvasCtx.restore()

    grid.updateLandmarks(results.poseWorldLandmarks)
  }

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
  pose.onResults(onResults)

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement })
    },
    width: 1280,
    height: 720
  })
  void camera.start()
}
