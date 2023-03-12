import type { Pose, Results } from '@mediapipe/pose'
import { useEffect, useRef, useState } from 'react'
import FileUpload from './beats-me/FileUpload'
import { diffPosesSubsetXY, grade } from '../util/scores'
import { guess } from 'web-audio-beat-detector'
import { clampBPM, MULTIPLIER_OPTIONS, PRESET_OPTIONS } from '../util/beats'
import SongInformation from './beats-me/SongInformation'
import Select from './beats-me/Select'
import { createPose, drawAllLandmarks, drawImportantLandmarks, startCamera } from '../util/mp'
import { writeDanceInformation, writeOverallGradeInformation, writeSongInformation, writeUIBackground } from '../util/ui'

import DANCES from '../dances/dances'
import type { Dance } from '../dances/dances'

const PUBLIC_DANCE_URL = '/videos/dance_2.mp4'

export default function GameManager (): JSX.Element {
  // Refs to UI elements
  const audioContextContainer = useRef<AudioContext | null>(null)
  const inputVideoRef = useRef<HTMLVideoElement | null>(null)
  const danceVideoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const poseRef = useRef<Pose | null>(null)

  // interval containers
  const beatIntervalContainer = useRef<number | undefined>(undefined)
  const danceIntervalContainer = useRef<number | undefined>(undefined)

  // states for beat/dance work
  const currentDanceRef = useRef<Dance>(DANCES[0])
  const lastKeyframe = useRef<number>(0)
  const currentFrameIndexRef = useRef<number>(0)
  const bestScoresRef = useRef<number[]>(new Array(15).fill(0))

  const [active, setActive] = useState(false)
  const [onBeat, setOnBeat] = useState(false)
  const [songData, setSongData] = useState({
    name: '',
    path: '',
    bpm: 0,
    period: 0,
    offset: 0
  })
  const [multiplier, setMultiplier] = useState(1)

  // ref helpers
  const bestScores = bestScoresRef.current
  const currentDance = currentDanceRef.current
  const currentFrameIndex = currentFrameIndexRef.current
  const effectiveBpm = songData.bpm === 0 ? 0 : songData.bpm * multiplier
  const effectivePeriodInMilliseconds = songData.period * 1000 / multiplier

  function loadSong (file: string, name?: string): void {
    setActive(false)
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

    // set up background elements
    writeUIBackground(canvasCtx, canvasElement)

    // target pose
    // get current dance move; diff based on last beat
    const { originalFps, lengthInSeconds, indices, keyframes } = currentDance

    const nextFrameIndex = (currentFrameIndex + 1) % indices.length
    const t = new Date().getTime() / 1000

    const timeSinceLastKeyframe = t - lastKeyframe.current
    const frameDiff = nextFrameIndex === 0
      ? lengthInSeconds * originalFps - indices[currentFrameIndex]
      : indices[nextFrameIndex] - indices[currentFrameIndex]
    const newFrameThreshold = frameDiff / originalFps

    if (active && timeSinceLastKeyframe >= newFrameThreshold) {
      currentFrameIndexRef.current = nextFrameIndex
      lastKeyframe.current = t
    }

    const currentKeyframe = keyframes[currentFrameIndex]

    drawImportantLandmarks(canvasCtx, currentKeyframe)

    if (results.poseLandmarks === undefined) {
      return
    }

    // draw the landmark diagrams
    drawAllLandmarks(canvasCtx, results.poseLandmarks)

    // then, userspace code :)
    const score = Math.max((1 - 10 * diffPosesSubsetXY(results.poseLandmarks, currentKeyframe)), 0) * 120
    bestScores.unshift(score)
    bestScores.pop()

    const halfSecBest = Math.max(...bestScores)

    // write text
    // TODO: change overall grade to be static
    writeOverallGradeInformation(canvasCtx, canvasElement, `${grade(halfSecBest)} (${halfSecBest.toFixed(1)})`)
    writeSongInformation(canvasCtx, canvasElement, songData.name, effectiveBpm)
    writeDanceInformation(canvasCtx, canvasElement, onBeat, grade(halfSecBest))
  }

  function onPlay (): void {
    // delay beat counter - wait for offset to start
    // setTimeout(() => {
    setActive(true)
    // start counting frames
    lastKeyframe.current = new Date().getTime() / 1000

    if (danceVideoRef.current === null) return
    const danceVideo = danceVideoRef.current

    // show dance video
    danceVideo.style.display = 'block'

    // set beat on/off
    beatIntervalContainer.current = setInterval(() => {
      setOnBeat(true)
      setTimeout(() => {
        setOnBeat(false)
      }, 200) // arbitrary - gives them 0.2s of grace
    }, effectivePeriodInMilliseconds)

    // set dance video loop
    danceVideo.playbackRate = multiplier
    danceVideo.currentTime = 0
    void danceVideo.play()

    danceIntervalContainer.current = setInterval(() => {
      danceVideo.currentTime = 0
    }, effectivePeriodInMilliseconds * currentDance.beatsInDance)
    // }, songData.offset * 1000)
  }

  function onPause (): void {
    setActive(false)
    clearInterval(beatIntervalContainer.current)
    clearInterval(danceIntervalContainer.current)
    if (danceVideoRef.current === null) return
    danceVideoRef.current.style.display = 'none'
  }

  // boilerplate to start audio context, MP
  useEffect(() => {
    loadSong(`/songs/${PRESET_OPTIONS[0].value}`, PRESET_OPTIONS[0].value)

    if (inputVideoRef.current === null || danceVideoRef.current === null) return

    const inputVideoElement = inputVideoRef.current
    poseRef.current = createPose()
    startCamera(poseRef.current, inputVideoElement)

    danceVideoRef.current.src = PUBLIC_DANCE_URL
    danceVideoRef.current.style.display = 'none'
  }, [])

  useEffect(() => {
    if (poseRef.current === null) return
    poseRef.current.onResults(onResults)
  }, [active, songData, onBeat, multiplier])

  return (<>
    <canvas width="1920px" height="1080px" style={{ width: '100vw' }} ref={canvasRef}></canvas>
    <video style={{ display: 'none' }} ref={inputVideoRef}></video>
    <video ref={danceVideoRef}
      style={{
        position: 'absolute',
        top: 0, // note: this is a hard-coded value
        right: 0,
        height: '25%',
        border: '1px solid black'
      }}
      // autoPlay
      muted
    />
    <audio className="my-4" src={songData.path} onPlay={onPlay} onPause={onPause} onEnded={onPause} controls></audio>
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
