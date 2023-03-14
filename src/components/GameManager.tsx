import type { Pose, Results } from '@mediapipe/pose'
import { useEffect, useRef, useState } from 'react'
import FileUpload from './beats-me/FileUpload'
import { diffPosesSubsetXY, grade } from '../util/scores'
import { guess } from 'web-audio-beat-detector'
import { clampBPM, DANCE_OPTIONS, MULTIPLIER_OPTIONS, PRESET_OPTIONS } from '../util/beats'
import Select from './beats-me/Select'
import { createPose, drawAllLandmarks, drawImportantLandmarks, startCamera } from '../util/mp'
import { drawUpcomingMoves, writeDanceInformation, writeOverallGradeInformation, writeSongInformation, writeUIBackground } from '../util/ui'

import DANCES from '../dances/dances'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type EndCard = {
  songsCompleted: number
  secondsDanced: number
}

export default function GameManager (): JSX.Element {
  // Refs to UI elements
  const audioContextContainer = useRef<AudioContext | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const inputVideoRef = useRef<HTMLVideoElement | null>(null)
  const danceVideoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const poseRef = useRef<Pose | null>(null)

  // interval containers
  const beatIntervalContainer = useRef<number | undefined>(undefined)
  const danceIntervalContainer = useRef<number | undefined>(undefined)
  const changeDanceIntervalContainer = useRef<number | undefined>(undefined)

  // states for beat/dance work
  const startDanceTimeInSecondsRef = useRef<number>(0)
  const currentFrameIndexRef = useRef<number>(0)
  const bestScoresRef = useRef<number[]>(new Array(15).fill(0))
  const overallScoreRef = useRef<number>(0)
  const overallScoreMoves = useRef<number>(0)
  const uniqueDances = useRef<Set<number>>(new Set())

  const [active, setActive] = useState(false)
  const [currentDanceIndex, setCurrentDanceIndex] = useState<number>(0)
  const [onBeat, setOnBeat] = useState(false)
  const [useRandomSongs, setUseRandomSongs] = useState(true)
  const [songData, setSongData] = useState({
    name: '',
    path: '',
    bpm: 0,
    offset: 0
  })
  const [multiplier, setMultiplier] = useState(1)
  const [debugMode, setDebugMode] = useState(true)
  const [endCard, setEndCard] = useState<EndCard | undefined>(undefined)

  // ref helpers
  const bestScores = bestScoresRef.current
  const currentDance = DANCES[currentDanceIndex]
  const effectiveBpm = songData.bpm === 0 ? 0 : songData.bpm * multiplier
  const effectiveOffsetInSeconds = songData.offset / multiplier / 1000
  const effectivePeriodInSeconds = songData.bpm === 0 ? 0 : (60 / effectiveBpm)

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

    const flipCanvas = (): void => {
      canvasCtx.translate(canvasElement.width, 0)
      canvasCtx.scale(-1, 1)
    }

    // flip canvas just for the image
    flipCanvas()
    canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height)
    flipCanvas()

    // necessary to "overlay"
    canvasCtx.globalCompositeOperation = 'source-over'

    // set up background elements
    writeUIBackground(canvasCtx, canvasElement)

    // target pose
    // get current dance move; diff based on last beat
    const { originalFps, indices, keyframes, totalFrames } = currentDance

    const timeSinceStartInSeconds = active ? new Date().getTime() / 1000 - startDanceTimeInSecondsRef.current - effectiveOffsetInSeconds : 0
    const framesSinceStart = timeSinceStartInSeconds * originalFps * effectiveBpm / currentDance.danceBpm
    if (active) {
      const nextFrameIndex = (currentFrameIndexRef.current + 1) % indices.length
      // console.log(`fss: ${framesSinceStart.toFixed(0)}, curr: ${indices[currentFrameIndexRef.current]}, nxt: ${indices[nextFrameIndex]}`)
      if (framesSinceStart > (nextFrameIndex === 0 ? totalFrames : indices[nextFrameIndex])) {
        currentFrameIndexRef.current = nextFrameIndex
      }
    }

    const currentKeyframe = keyframes[currentFrameIndexRef.current]

    if (debugMode) {
      flipCanvas()
      drawImportantLandmarks(canvasCtx, currentKeyframe)
      flipCanvas()
    }

    flipCanvas()
    drawUpcomingMoves(canvasCtx, canvasElement, currentDance, currentFrameIndexRef.current, totalFrames, framesSinceStart)
    flipCanvas()

    if (results.poseLandmarks === undefined) {
      return
    }

    // draw the landmark diagrams
    if (debugMode) {
      flipCanvas()
      drawAllLandmarks(canvasCtx, results.poseLandmarks)
      flipCanvas()
    }

    // then, userspace code :)
    const score = Math.max((1 - 10 * diffPosesSubsetXY(results.poseLandmarks, currentKeyframe)), 0) * 120
    bestScores.unshift(score)
    bestScores.pop()

    const halfSecBest = Math.max(...bestScores)

    // write text
    writeOverallGradeInformation(canvasCtx, canvasElement, `${grade(overallScoreRef.current / overallScoreMoves.current)} [${overallScoreMoves.current === 0 ? '0' : (overallScoreRef.current / overallScoreMoves.current).toFixed(0)}] ${debugMode ? `(${overallScoreRef.current.toFixed(0)}) ` : ''}`)
    writeSongInformation(canvasCtx, canvasElement, songData.name, effectiveBpm)
    writeDanceInformation(canvasCtx, canvasElement, onBeat, `${grade(halfSecBest)} ${debugMode ? `(${halfSecBest.toFixed(0)})` : ''}`)
  }

  function onPlay (): void {
    // delay beat counter - wait for offset to start
    setTimeout(() => {
      setActive(true)
      // start counting frames
      startDanceTimeInSecondsRef.current = new Date().getTime() / 1000
      currentFrameIndexRef.current = 0
      uniqueDances.current.add(currentDanceIndex)

      if (danceVideoRef.current === null) return
      const danceVideo = danceVideoRef.current

      // show dance video
      danceVideo.style.display = 'block'

      // set beat on/off
      beatIntervalContainer.current = setInterval(() => {
        overallScoreRef.current += Math.max(...bestScores)
        overallScoreMoves.current += 1
        setOnBeat(true)
        setTimeout(() => {
          setOnBeat(false)
        }, 200) // arbitrary - gives them 0.2s of grace
      }, effectivePeriodInSeconds * 1000)

      // set dance video loop
      danceVideo.playbackRate = effectiveBpm / currentDance.danceBpm
      danceVideo.currentTime = 0
      void danceVideo.play()

      danceIntervalContainer.current = setInterval(() => {
        danceVideo.currentTime = 0
        currentFrameIndexRef.current = 0
        startDanceTimeInSecondsRef.current = new Date().getTime() / 1000
      }, effectivePeriodInSeconds * currentDance.beatsInDance * 1000)

      if (useRandomSongs) {
        changeDanceIntervalContainer.current = setInterval(() => {
          const newDanceIndex = Math.floor(Math.random() * DANCES.length)
          uniqueDances.current.add(newDanceIndex)
          setCurrentDanceIndex(newDanceIndex)
        }, effectivePeriodInSeconds * 1000 * 16) // this is hardcoded for every 16 beats
      }
    }, (songData.offset + 1 / 15) * 1000)
  }

  function onPause (): void {
    setActive(false)
    clearInterval(beatIntervalContainer.current)
    clearInterval(danceIntervalContainer.current)
    clearInterval(changeDanceIntervalContainer.current)
    if (danceVideoRef.current === null) return
    danceVideoRef.current.style.display = 'none'
  }

  function onEnded (): void {
    onPause()
    if (audioRef.current === null) return
    audioRef.current.currentTime = 0
    audioRef.current.pause()
    const newEndCard: EndCard = endCard === undefined ? { songsCompleted: 0, secondsDanced: 0 } : { ...endCard }
    newEndCard.songsCompleted += 1
    newEndCard.secondsDanced += audioRef.current.duration
    setEndCard(newEndCard)
  }

  // boilerplate to start audio context, MP
  useEffect(() => {
    loadSong(`/songs/${PRESET_OPTIONS[0].value}`, PRESET_OPTIONS[0].value)

    if (inputVideoRef.current === null || danceVideoRef.current === null) return

    const inputVideoElement = inputVideoRef.current
    poseRef.current = createPose()
    startCamera(poseRef.current, inputVideoElement)

    danceVideoRef.current.src = `/videos/${currentDance.videoUrl}`
    danceVideoRef.current.style.display = 'none'
  }, [])

  useEffect(() => {
    if (poseRef.current === null) return
    poseRef.current.onResults(onResults)
  }, [active, songData, onBeat, multiplier, debugMode, currentDanceIndex, endCard])

  useEffect(() => {
    if (inputVideoRef.current === null || danceVideoRef.current === null) return

    danceVideoRef.current.src = `/videos/${currentDance.videoUrl}`

    if (active) {
      onPause()
      onPlay()
      if (poseRef.current === null) return
      poseRef.current.onResults(onResults)
    }
  }, [currentDanceIndex])

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
      muted
    />
    <div className='rounded overflow-hidden shadow-lg px-3 py-4 bg-white' style={{ width: '100vw' }}>
      <div className="sm:grid sm:grid-cols-3 sm:gap-2 my-2">
        <div>
          <audio className="my-4" src={songData.path} onPlay={onPlay} onPause={onPause} onEnded={onEnded} ref={audioRef} controls></audio>
          {/*
            debugMode && <button onClick={() => { console.log(currentDance.indices[currentFrameIndexRef.current]); currentFrameIndexRef.current = (currentFrameIndexRef.current + 1) % currentDance.indices.length }}>force new frame</button>
          */}
          <FileUpload loadSong={loadSong}/>
        </div>
        <div className="text-left ">
          <dl
            className="sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 py-4"
            role="radiogroup"
            aria-labelledby="multiplier-label"
          >
            <dt className="text-gray-500" id="multiplier-label">Speed Multiplier</dt>
            <dd className="text-gray-900">
              <Select options={MULTIPLIER_OPTIONS} updateValue={(x) => { setMultiplier(Number(x)) }} />
            </dd>
            <dt className="text-gray-500" id="preset-songs">Preset Songs</dt>
            <dd className="text-gray-900">
              <Select options={PRESET_OPTIONS} updateValue={(song) => { loadSong(`/songs/${song}`, song) }} />
            </dd>
            <dt className="text-gray-500" id="preset-songs">Preset Dances</dt>
            <dd className="text-gray-900">
              <Select options={DANCE_OPTIONS} updateValue={(x) => { setCurrentDanceIndex(Number(x)) }} />
            </dd>
            <dt className="text-gray-500" id="preset-songs">Random Songs</dt>
            <dd className="text-gray-900">
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  role="switch"
                  checked={useRandomSongs}
                  onChange={() => { setUseRandomSongs(!useRandomSongs) }}
                  name="toggle"
                  id="toggle"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </dd>
            <dt className="text-gray-500" id="preset-songs">Debug Mode</dt>
            <dd className="text-gray-900">
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  role="switch"
                  checked={debugMode}
                  onChange={() => { setDebugMode(!debugMode) }}
                  name="toggle"
                  id="toggle"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
              </div>
            </dd>
          </dl>
        </div>
        <div>
          {endCard !== undefined && <dl
            className="sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6 py-4"
          >
            <dt className="text-gray-500">Songs Completed</dt>
            <dd className="text-gray-900">
              {endCard.songsCompleted}
            </dd>
            <dt className="text-gray-500">Minutes Danced</dt>
            <dd className="text-gray-900">
              {`${(endCard.secondsDanced / 60).toFixed(0)}m ${(endCard.secondsDanced % 60).toFixed(0)}s`}
            </dd>
            <dt className="text-gray-500">Unique Dances</dt>
            <dd className="text-gray-900">
              {uniqueDances.current.size}
            </dd>
          </dl>}
        </div>
      </div>
    </div>
  </>)
}
