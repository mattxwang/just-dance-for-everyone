import { useRef } from 'react'

interface Props {
  multiplier: number
  offset: number
  path: string
  period: number
  setOnBeat: (onBeat: boolean) => void
}

export default function AudioController ({ setOnBeat, multiplier, path, period, offset }: Props): JSX.Element {
  const beatIntervalContainer = useRef<number | undefined>(undefined)
  function onPlay (): void {
    setTimeout(() => {
      beatIntervalContainer.current = setInterval(() => {
        setOnBeat(true)
        setTimeout(() => {
          setOnBeat(false)
        }, 200)
      }, (period * 1000) / multiplier)
    }, offset * 1000)
  }

  function onPause (): void {
    clearInterval(beatIntervalContainer.current)
  }

  return <audio className="my-4" src={path} onPlay={onPlay} onPause={onPause} controls></audio>
}
