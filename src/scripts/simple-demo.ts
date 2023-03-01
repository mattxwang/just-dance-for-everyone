import { Pose, POSE_CONNECTIONS, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_NEUTRAL, POSE_LANDMARKS_RIGHT } from '@mediapipe/pose'
import type { Results } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'

export default function simpleDemo (): void {
  const videoElement = document.getElementsByClassName('input_video')[0] as HTMLVideoElement
  const canvasElement = document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement
  const canvasCtx = canvasElement.getContext('2d') as CanvasRenderingContext2D

  const statsElement = document.getElementById('stats-box') as HTMLDivElement

  function onResults (results: Results): void {
    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)

    canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height)

    canvasCtx.globalCompositeOperation = 'source-over'

    drawConnectors(
      canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
      { visibilityMin: 0.65, color: 'white' })
    drawLandmarks(
      canvasCtx,
      Object.values(POSE_LANDMARKS_LEFT)
        .map(index => results.poseLandmarks[index]),
      { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)' })
    drawLandmarks(
      canvasCtx,
      Object.values(POSE_LANDMARKS_RIGHT)
        .map(index => results.poseLandmarks[index]),
      { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)' })
    drawLandmarks(
      canvasCtx,
      Object.values(POSE_LANDMARKS_NEUTRAL)
        .map(index => results.poseLandmarks[index]),
      { visibilityMin: 0.65, color: 'white', fillColor: 'black' })
    canvasCtx.restore()

    function yPoseDiff (l1: number, l2: number): number {
      const l1Obj = results.poseLandmarks[l1]
      const l2Obj = results.poseLandmarks[l2]

      const ydiff = l1Obj.y - l2Obj.y

      return ydiff / l2Obj.y * 100
    }

    const seLWithinThreshold = Math.abs(
      yPoseDiff(POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_ELBOW)
    ) < 15

    const weLWithinThreshold = Math.abs(
      yPoseDiff(POSE_LANDMARKS_LEFT.LEFT_WRIST, POSE_LANDMARKS_LEFT.LEFT_ELBOW)
    ) < 10

    const seRWithinThreshold = Math.abs(
      yPoseDiff(POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_ELBOW)
    ) < 15

    const weRWithinThreshold = Math.abs(
      yPoseDiff(POSE_LANDMARKS_RIGHT.RIGHT_WRIST, POSE_LANDMARKS_RIGHT.RIGHT_ELBOW)
    ) < 10

    // diffing code
    statsElement.innerHTML = `
      left shoulder-elbow: ${
        seLWithinThreshold ? '<span style="color:green">good job!</span>' : '<span style="color:red">not quite :(</span>'}<br />
      left elbow-hand : ${
        weLWithinThreshold ? '<span style="color:green">good job!</span>' : '<span style="color:red">not quite :(</span>'}<br />
      }<br />
      right shoulder-elbow: ${
        seRWithinThreshold ? '<span style="color:green">good job!</span>' : '<span style="color:red">not quite :(</span>'}<br />
      right elbow-hand : ${
        weRWithinThreshold ? '<span style="color:green">good job!</span>' : '<span style="color:red">not quite :(</span>'}<br />
      }<br />
    `
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
