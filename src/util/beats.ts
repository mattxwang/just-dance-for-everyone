
export function clampBPM (bpm: number): number {
  if (bpm > 160) {
    return clampBPM(bpm / 2)
  }
  if (bpm < 40) {
    return clampBPM(bpm * 2)
  }
  return bpm
}

const PRESETS = [
  'champagne.mp3',
  'class.mp3',
  'delight.mp3',
  'drawl.mp3',
  'haze.mp3',
  'heaven.mp3',
  'inferno.mp3',
  'lounge.mp3',
  'monster.mp3',
  'qwerhacks.mp3',
  'tennis.mp3'
]

export const PRESET_OPTIONS = PRESETS.map(preset => { return { label: preset, value: preset } })

export const MULTIPLIER_OPTIONS = [
  {
    label: 'Normal',
    value: '1'
  },
  {
    label: 'Double-time',
    value: '2'
  },
  {
    label: 'Half-time',
    value: '0.5'
  },
  {
    label: 'Quad-time',
    value: '4'
  },
  {
    label: 'Quarter-time',
    value: '0.25'
  }
]
