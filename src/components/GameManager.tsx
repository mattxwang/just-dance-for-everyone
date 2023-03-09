import type { Pose, Results } from '@mediapipe/pose'
import { POSE_LANDMARKS_LEFT } from '@mediapipe/pose'
import { useEffect, useRef, useState } from 'react'
import FileUpload from './beats-me/FileUpload'
import { grade, normalizeScore, xyAngleDeg } from '../util/scores'
import { guess } from 'web-audio-beat-detector'
import { clampBPM, MULTIPLIER_OPTIONS, PRESET_OPTIONS } from '../util/beats'
import AudioController from './beats-me/AudioController'
import SongInformation from './beats-me/SongInformation'
import Select from './beats-me/Select'
import { createPose, drawAllLandmarks, startCamera } from '../util/mp'

export default function GameManager (): JSX.Element {
  const audioContextContainer = useRef<AudioContext | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const poseRef = useRef<Pose | null>(null)
  const bestScoresRef = useRef<number[]>(new Array(30 * 5).fill(0))
  const bestScores = bestScoresRef.current

  const [onBeat, setOnBeat] = useState(false)
  const [songData, setSongData] = useState({
    name: '',
    path: '',
    bpm: 0,
    period: 0,
    offset: 0
  })
  const [multiplier, setMultiplier] = useState(1)

  const writeUIBackground = (canvasCtx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement): void => {
    canvasCtx.globalAlpha = 0.85
    canvasCtx.fillStyle = 'lightblue'

    canvasCtx.fillRect(0, 0, canvasElement.width, 72)
    canvasCtx.fillRect(0, canvasElement.height - 36, canvasElement.width, 36)

    canvasCtx.globalAlpha = 1.0
  }

  const writeGradeInformation = (grade: string, canvasCtx: CanvasRenderingContext2D): void => {
    canvasCtx.fillStyle = 'black'
    canvasCtx.font = 'bold 48px Poppins'
    canvasCtx.fillText(grade, 50, 50)
  }

  const writeSongInformation = (canvasCtx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement): void => {
    canvasCtx.fillStyle = 'black'
    canvasCtx.font = '24px Poppins'
    canvasCtx.fillText(`song: ${songData.name}`, 50, canvasElement.height - 12)
    // TODO: translate and right-align
    canvasCtx.fillText(`bpm: ${clampBPM(songData.bpm)} | high intensity`, canvasElement.width - 400, canvasElement.height - 12)
  }

  const writeDanceInformation = (canvasCtx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement): void => {
    canvasCtx.fillStyle = 'black'
    canvasCtx.font = '36px Poppins'
    canvasCtx.fillText(`${onBeat ? 'dance' : ''}`, canvasElement.width - 200, canvasElement.height / 2)
  }

  function loadSong (file: string, name?: string): void {
    if (audioContextContainer.current == null) {
      const AudioContext = window.AudioContext
      audioContextContainer.current = new AudioContext()
    }
    const audioContext = audioContextContainer.current
    fetch(file)
      .then(async (data) => await data.arrayBuffer())
      .then(async (buffer) => await audioContext.decodeAudioData(buffer))
      .then(async (audioBuffer) => await guess(audioBuffer))
      .then((obj) => {
        const clampedBPM = clampBPM(obj.bpm)
        console.log(`loaded: ${name ?? file}`)
        setSongData({
          name: name ?? file,
          path: file,
          bpm: clampedBPM,
          period: 1 / (clampedBPM / 60),
          offset: obj.offset
        })
      })
      .catch((err) => { console.error(err) })
  }

  function onResults (results: Results): void {
    if (canvasRef.current === null) return
    const canvasElement = canvasRef.current
    const canvasCtx = canvasElement.getContext('2d') as CanvasRenderingContext2D

    // pre-work: clear canvas, re-draw video
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height)

    // necessary to "overlay"
    canvasCtx.globalCompositeOperation = 'source-over'

    // draw the landmark diagrams
    drawAllLandmarks(canvasCtx, results.poseLandmarks)

    // then, userspace code :)
    const seAngle = xyAngleDeg(results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER], results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_ELBOW])
    const ehAngle = xyAngleDeg(results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_ELBOW], results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_WRIST])
    const shAngle = xyAngleDeg(results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_SHOULDER], results.poseLandmarks[POSE_LANDMARKS_LEFT.LEFT_WRIST])

    function scoreStraightLeftArm (): number {
      const seAngleTarget = 0
      const ehAngleTarget = 0

      const seAngleScore = seAngleTarget - seAngle
      const ehAngleScore = ehAngleTarget - ehAngle

      return normalizeScore(Math.abs(seAngleScore) + Math.abs(ehAngleScore) + Math.abs(shAngle), 135)
    }

    const score = scoreStraightLeftArm()
    bestScores.unshift(score)
    bestScores.pop()

    const halfSecBest = Math.max(...(bestScores.slice(0, 15)))
    // const fiveSecBest = Math.max(...bestScores)

    // set up background elements
    writeUIBackground(canvasCtx, canvasElement)

    // write text
    writeGradeInformation(grade(halfSecBest), canvasCtx)
    writeSongInformation(canvasCtx, canvasElement)
    writeDanceInformation(canvasCtx, canvasElement)
  }

  // boilerplate to start audio context, MP
  useEffect(() => {
    loadSong(`/songs/${PRESET_OPTIONS[0].value}`, PRESET_OPTIONS[0].value)

    if (videoRef.current === null) return

    const videoElement = videoRef.current
    poseRef.current = createPose()
    startCamera(poseRef.current, videoElement)
  }, [])

  useEffect(() => {
    if (poseRef.current === null) return
    poseRef.current.onResults(onResults)
  }, [songData, onBeat])

  return (<>
    <canvas width="1920px" height="1080px" style={{ width: '100vw' }} ref={canvasRef}></canvas>
    <video style={{ display: 'none' }} ref={videoRef}></video>
    <AudioController setOnBeat={setOnBeat} multiplier={multiplier} {...songData} />
    <div className="lg:grid lg:grid-cols-2 lg:gap-4">
      <div className="max-w-md rounded overflow-hidden shadow-lg px-3 py-4 mb-2 bg-white text-left">
        <SongInformation {...songData}/>
        <dl
          className="sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 py-4"
          role="radiogroup"
          aria-labelledby="multiplier-label"
        >
          <dt className="text-gray-500" id="multiplier-label">Multiplier</dt>
          <dd className="text-gray-900">
            <Select options={MULTIPLIER_OPTIONS} updateValue={(x) => { setMultiplier(Number(x)) }} />
          </dd>
      </dl>
      </div>
      <div className="rounded overflow-hidden shadow-lg px-3 py-4 mb-2 bg-white">
        <p className="mb-3">choose from our presets:</p>
        <Select options={PRESET_OPTIONS} updateValue={(song) => { loadSong(`/songs/${song}`, song) }} />
        <p className="my-3">or, upload a custom song</p>
        <FileUpload loadSong={loadSong}/>
      </div>
    </div>
  </>)
}
