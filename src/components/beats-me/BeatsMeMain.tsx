import AudioController from './AudioController'
import BeatIndicator from './BeatIndicator'
import FileUpload from './FileUpload'
import Select from './Select'
import SongInformation from './SongInformation'
import { clampBPM, PRESET_OPTIONS, MULTIPLIER_OPTIONS } from '../../util/beats'
import { useRef, useState } from 'react'
import { guess } from 'web-audio-beat-detector'

export default function BeatsMeMain (): JSX.Element {
  const audioContextContainer = useRef<AudioContext | null>(null)

  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [onBeat, setOnBeat] = useState(false)
  const [songData, setSongData] = useState({
    name: '',
    path: '',
    bpm: 0,
    period: 0,
    offset: 0
  })
  const [multiplier, setMultiplier] = useState(1)

  function loadSong (file: string, name?: string): void {
    setLoading(true)
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
        setLoading(false)
      })
      .catch((err) => { console.error(err) })
  }

  function setup (): void {
    setLoaded(true)
    loadSong(`/songs/${PRESET_OPTIONS[0].value}`, PRESET_OPTIONS[0].value)
  }

  if (!loaded) {
    return <button className="btn btn-blue" onClick={setup}>start</button>
  }

  if (loading) {
    return <p>loading...</p>
  }

  return (
    <>
      <BeatIndicator on={onBeat} />
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
    </>
  )
}
