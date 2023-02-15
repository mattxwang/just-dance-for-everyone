interface Props {
  name: string
  bpm: number
  period: number
  offset: number
}

export default function SongInformation (props: Props): JSX.Element {
  const { name, bpm, period, offset } = props
  return (
    <dl className="sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
      <dt className="text-gray-500">Song</dt>
      <dd className="text-gray-900">{name}</dd>

      <dt className="text-gray-500">BPM / Period</dt>
      <dd className="text-gray-900">{bpm.toFixed(2)} / {period.toFixed(2)}s</dd>

      <dt className="text-gray-500">Offset</dt>
      <dd className="text-gray-900">{offset.toFixed(2)}s</dd>
    </dl>
  )
}
