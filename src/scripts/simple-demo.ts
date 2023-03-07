import { Pose, POSE_CONNECTIONS, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_NEUTRAL, POSE_LANDMARKS_RIGHT } from '@mediapipe/pose'
import type { NormalizedLandmark, Results } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'

export default function simpleDemo (): void {
  const videoElement = document.getElementsByClassName('input_video')[0] as HTMLVideoElement
  const canvasElement = document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement
  const canvasCtx = canvasElement.getContext('2d') as CanvasRenderingContext2D

  const statsElement = document.getElementById('stats-box') as HTMLDivElement

  let counter = 0

  const bestScores = new Array(30 * 5).fill(0)

  function onResults (results: Results): void {
    counter += 1
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

    // function xDistance (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
    //   return Math.abs(l1.x - l2.x)
    // }

    // function yDistance (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
    //   return Math.abs(l1.y - l2.y)
    // }

    // function zDistance (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
    //   return Math.abs(l1.z - l2.z)
    // }

    function xyAngleRad (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
      return Math.asin((l1.y - l2.y) / cartesianDistance(l1, l2))
    }

    function xyAngleDeg (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
      return xyAngleRad(l1, l2) * 180 / Math.PI
    }

    function cartesianDistance (l1: NormalizedLandmark, l2: NormalizedLandmark): number {
      return Math.sqrt(
        (l1.x - l2.x) ** 2 +
        (l1.y - l2.y) ** 2 +
        (l1.z - l2.z) ** 2
      )
    }

    function logXYZ (l: NormalizedLandmark): string {
      return `x: ${l.x.toFixed(3)}, y: ${l.y.toFixed(3)}, z: ${l.z.toFixed(3)}`
    }

    function xPoseDiff (l1: number, l2: number): number {
      const l1Obj = results.poseLandmarks[l1]
      const l2Obj = results.poseLandmarks[l2]

      return l1Obj.x - l2Obj.x
    }

    function yPoseDiff (l1: number, l2: number): number {
      const l1Obj = results.poseLandmarks[l1]
      const l2Obj = results.poseLandmarks[l2]

      const ydiff = l1Obj.y - l2Obj.y

      return ydiff / l2Obj.y * 100
    }

    const seL = yPoseDiff(POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_ELBOW)

    const seLWithinThreshold = Math.abs(seL) < 5

    const weL = yPoseDiff(POSE_LANDMARKS_LEFT.LEFT_WRIST, POSE_LANDMARKS_LEFT.LEFT_ELBOW)

    const weLWithinThreshold = Math.abs(weL) < 5

    // const seRWithinThreshold = Math.abs(
    //   yPoseDiff(POSE_LANDMARKS_RIGHT.RIGHT_SHOULDER, POSE_LANDMARKS_RIGHT.RIGHT_ELBOW)
    // ) < 15

    // const weRWithinThreshold = Math.abs(
    //   yPoseDiff(POSE_LANDMARKS_RIGHT.RIGHT_WRIST, POSE_LANDMARKS_RIGHT.RIGHT_ELBOW)
    // ) < 10

    const seLX = xPoseDiff(POSE_LANDMARKS_LEFT.LEFT_SHOULDER, POSE_LANDMARKS_LEFT.LEFT_ELBOW)
    const weLX = xPoseDiff(POSE_LANDMARKS_LEFT.LEFT_WRIST, POSE_LANDMARKS_LEFT.LEFT_ELBOW)

    const seAngle = xyAngleDeg(results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER], results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_ELBOW])
    const ehAngle = xyAngleDeg(results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_ELBOW], results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_WRIST])
    const shAngle = xyAngleDeg(results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER], results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_WRIST])

    /**
     * convex "smoothing" to reward good dances :)
     * @param rawScore invariant: Math.abs(rawScore) < max
     * @param max positive max
     * @returns num between 0 and 100
     */
    function normalizeScore (rawScore: number, max: number): number {
      // arbitrarily convex curve
      return Math.pow((Math.abs(max - Math.abs(rawScore)) / max), 1.5) * 120
    }

    /**
     * letter grade for score
     * @param score nonnegative score
     */
    function grade (score: number): string {
      if (score > 80) {
        return 'A'
      }
      if (score > 70) {
        return 'B'
      }
      if (score > 60) {
        return 'C'
      }
      if (score > 50) {
        return 'D'
      }
      return 'F'
    }

    function scoreStraightLeftArm (): number {
      const seAngleTarget = 0
      const ehAngleTarget = 0

      const seAngleScore = seAngleTarget - seAngle
      const ehAngleScore = ehAngleTarget - ehAngle

      return normalizeScore(Math.abs(seAngleScore) + Math.abs(ehAngleScore) + Math.abs(shAngle), 135)
      // return (normalizeScore(seAngleScore, 45) + normalizeScore(ehAngleScore, 45) + normalizeScore(shAngle, 45)) / 3
    }

    const score = scoreStraightLeftArm()
    bestScores.unshift(score)
    bestScores.pop()

    const halfSecBest = Math.max(...(bestScores.slice(0, 15)))
    const fiveSecBest = Math.max(...bestScores)

    // diffing code
    statsElement.innerHTML = `
      <h2>current demo: make your left arm straight!</h2>
      grade/score:
      current: ${grade(score)} | ${score.toFixed(3)}<br />
      0.5s window: ${grade(halfSecBest)} | ${halfSecBest.toFixed(3)}<br />
      5s window: ${grade(fiveSecBest)} | ${fiveSecBest.toFixed(3)}<br />
      left shoulder-elbow: ${
        seLWithinThreshold ? '<span style="color:green">good job!</span>' : '<span style="color:red">not quite :(</span>'}<br />
      left elbow-hand : ${
        weLWithinThreshold ? '<span style="color:green">good job!</span>' : '<span style="color:red">not quite :(</span>'}<br />
      counter: ${counter % 30}<br />
      shoulder-elbow angle: ${seAngle.toFixed(3)}<br />
      elbow-hand angle: ${ehAngle.toFixed(3)}<br />
      shoulder-elbow / elbow-hand ratio: ${(Math.abs(seLX) / (Math.abs(weLX) + Math.abs(seLX)) * 100).toFixed(2)}<br />
      nose: ${logXYZ(results.poseLandmarks[POSE_LANDMARKS_NEUTRAL.NOSE])}<br />
      lshoulder: ${logXYZ(results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER])}<br />
    `
  }

  // right shoulder-elbow: ${
  //   seRWithinThreshold ? '<span style="color:green">good job!</span>' : '<span style="color:red">not quite :(</span>'}<br />
  // right elbow-hand : ${
  //   weRWithinThreshold ? '<span style="color:green">good job!</span>' : '<span style="color:red">not quite :(</span>'}<br />
  // }<br />

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
