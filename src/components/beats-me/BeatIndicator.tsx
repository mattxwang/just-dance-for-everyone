interface Props {
  on: boolean
}

export default function BeatIndicator (props: Props): JSX.Element {
  const { on } = props
  const bg = on ? 'bg-green-700' : 'bg-gray-900'
  const text = on ? 'on' : 'off'
  return <div className={`large-circle text-white ${bg}`}>
    {text}
  </div>
}
