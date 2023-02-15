import { Pose, POSE_CONNECTIONS, VERSION, type Results, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_RIGHT, POSE_LANDMARKS_NEUTRAL, type Options } from '@mediapipe/pose'
import { StaticText, Toggle, SourcePicker, type InputImage, type Rectangle, Slider, ControlPanel, FPS } from '@mediapipe/control_utils'
// this import breaks the code
// import {LandmarkGrid, MeshViewer} from '@mediapipe/control_utils_3d'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import DeviceDetector from 'device-detector-js'

export default function complexDemo (): void {
  testSupport([
    { client: 'Chrome' }
  ])

  function testSupport (supportedDevices: Array<{ client?: string, os?: string }>): void {
    const deviceDetector = new DeviceDetector()
    const detectedDevice = deviceDetector.parse(navigator.userAgent)

    if (detectedDevice.client === null || detectedDevice.os === null) {
      return
    }

    let isSupported = false
    for (const device of supportedDevices) {
      if (device.client !== undefined) {
        const re = new RegExp(`^${device.client}$`)
        if (!re.test(detectedDevice.client.name)) {
          continue
        }
      }
      if (device.os !== undefined) {
        const re = new RegExp(`^${device.os}$`)
        if (!re.test(detectedDevice.os.name)) {
          continue
        }
      }
      isSupported = true
      break
    }
    if (!isSupported) {
      alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
            'is not well supported at this time, expect some flakiness while we improve our code.')
    }
  }

  const options = {
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${VERSION}/${file}`
    }
  }

  // Our input frames will come from here.
  const videoElement =
      document.getElementsByClassName('input_video')[0] as HTMLVideoElement
  const canvasElement =
      document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement
  const controlsElement =
      document.getElementsByClassName('control-panel')[0] as HTMLDivElement
  const canvasCtx = canvasElement.getContext('2d') as CanvasRenderingContext2D

  // We'll add this to our control panel later, but we'll save it here so we can
  // call tick() each time the graph runs.
  const fpsControl = new FPS()

  // TODO: fix
  // const landmarkContainer =
  // document.getElementsByClassName('landmark-grid-container')[0] as HTMLDivElement
  // const grid = new LandmarkGrid(landmarkContainer, {
  //   connectionColor: 0xCCCCCC,
  //   definedColors:
  //       [{ name: 'LEFT', value: 0xffa500 }, { name: 'RIGHT', value: 0x00ffff }],
  //   range: 2,
  //   fitToGrid: true,
  //   labelSuffix: 'm',
  //   landmarkSize: 2,
  //   numCellsPerAxis: 4,
  //   showHidden: false,
  //   centered: true
  // })

  let activeEffect = 'mask'
  function onResults (results: Results): void {
    // Update the frame rate.
    fpsControl.tick()

    // Draw the overlays.
    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)

    // note: the type on this is wrong
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (results.segmentationMask) {
      canvasCtx.drawImage(
        results.segmentationMask, 0, 0, canvasElement.width,
        canvasElement.height)

      // Only overwrite existing pixels.
      if (activeEffect === 'mask' || activeEffect === 'both') {
        canvasCtx.globalCompositeOperation = 'source-in'
        // This can be a color or a texture or whatever...
        canvasCtx.fillStyle = '#00FF007F'
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height)
      } else {
        canvasCtx.globalCompositeOperation = 'source-out'
        canvasCtx.fillStyle = '#0000FF7F'
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height)
      }

      // Only overwrite missing pixels.
      canvasCtx.globalCompositeOperation = 'destination-atop'
      canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height)

      canvasCtx.globalCompositeOperation = 'source-over'
    } else {
      canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height)
    }

    if (results.poseLandmarks !== null) {
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
        { visibilityMin: 0.65, color: 'white', fillColor: 'white' })
    }
    canvasCtx.restore()

    // TODO: fix
    // if (results.poseWorldLandmarks !== null) {
    //   grid.updateLandmarks(results.poseWorldLandmarks, POSE_CONNECTIONS, [
    //     { list: Object.values(POSE_LANDMARKS_LEFT), color: 'LEFT' },
    //     { list: Object.values(POSE_LANDMARKS_RIGHT), color: 'RIGHT' }
    //   ])
    // } else {
    //   grid.updateLandmarks([])
    // }
  }

  const pose = new Pose(options)
  pose.onResults(onResults)

  // Present a control panel through which the user can manipulate the solution
  // options.
  new ControlPanel(controlsElement, {
    selfieMode: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
    effect: 'background'
  })
    .add([
      new StaticText({ title: 'MediaPipe Pose' }),
      fpsControl,
      new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
      new SourcePicker({
        onSourceChanged: () => {
          // Resets because this model gives better results when reset between
          // source changes.
          pose.reset()
        },
        onFrame:
              async (input: InputImage, size: Rectangle) => {
                const aspect = size.height / size.width
                let width: number, height: number
                if (window.innerWidth > window.innerHeight) {
                  height = window.innerHeight
                  width = height / aspect
                } else {
                  width = window.innerWidth
                  height = width * aspect
                }
                canvasElement.width = width
                canvasElement.height = height
                await pose.send({ image: input })
              }
      }),
      new Slider({
        title: 'Model Complexity',
        field: 'modelComplexity',
        discrete: ['Lite', 'Full', 'Heavy']
      }),
      new Toggle(
        { title: 'Smooth Landmarks', field: 'smoothLandmarks' }),
      new Toggle(
        { title: 'Enable Segmentation', field: 'enableSegmentation' }),
      new Toggle(
        { title: 'Smooth Segmentation', field: 'smoothSegmentation' }),
      new Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
      }),
      new Slider({
        title: 'Effect',
        field: 'effect',
        discrete: { background: 'Background', mask: 'Foreground' }
      })
    ])
    .on(x => {
      const options = x as Options
      videoElement.classList.toggle('selfie', options.selfieMode)
      activeEffect = (x as Record<string, string>).effect
      pose.setOptions(options)
    })
}
