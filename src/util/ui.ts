import { drawConnectors } from '@mediapipe/drawing_utils'
import { POSE_CONNECTIONS } from '@mediapipe/pose'
import type { Dance } from '../dances/dances'
import { intensity } from './scores'

const VERTICAL_TRANSLATE_FACTOR = 3

export const drawUpcomingMoves = (canvasCtx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement, dance: Dance, currentFrameIndex: number, totalFrames: number, framesSinceStart: number): void => {
  const danceLength = dance.indices.length
  let curr = currentFrameIndex
  let next = (curr + 1) % danceLength
  let relFrame = framesSinceStart

  canvasCtx.scale(0.2, 0.2)
  canvasCtx.translate(canvasElement.width / 2, canvasElement.height * VERTICAL_TRANSLATE_FACTOR)

  canvasCtx.fillStyle = 'black'
  canvasCtx.fillRect(canvasElement.width / 2, 0, 5, canvasElement.height)

  let count = 0

  for (let i = 0; i < danceLength; i++) {
    const framesUntilCurrFrame = (totalFrames + dance.indices[next] - relFrame) % totalFrames
    const translateDiff = framesUntilCurrFrame / totalFrames

    count += translateDiff
    canvasCtx.translate(-translateDiff * canvasElement.width, 0)
    drawConnectors(
      canvasCtx, dance.keyframes[next], POSE_CONNECTIONS,
      { visibilityMin: 0.65, color: 'white' })

    curr = next
    next = (curr + 1) % danceLength
    relFrame = dance.indices[curr]
  }

  canvasCtx.translate((count - 0.5) * canvasElement.width, -canvasElement.height * VERTICAL_TRANSLATE_FACTOR)
  canvasCtx.scale(5, 5)
}

export const writeUIBackground = (canvasCtx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement): void => {
  canvasCtx.globalAlpha = 0.85
  canvasCtx.fillStyle = 'lightblue'

  canvasCtx.fillRect(0, 0, canvasElement.width, 72)
  canvasCtx.fillRect(0, canvasElement.height - 36, canvasElement.width, 36)

  canvasCtx.globalAlpha = 1.0
}

export const writeOverallGradeInformation = (canvasCtx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement, grade: string): void => {
  canvasCtx.fillStyle = 'black'
  canvasCtx.font = 'bold 48px Poppins'
  canvasCtx.fillText(grade, 50, 50)
}

export const writeSongInformation = (canvasCtx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement, name: string, bpm: number): void => {
  canvasCtx.fillStyle = 'black'
  canvasCtx.font = '24px Poppins'
  canvasCtx.fillText(`song: ${name}`, 50, canvasElement.height - 12)
  // TODO: translate and right-align
  canvasCtx.fillText(`bpm: ${bpm} | ${intensity(bpm)} intensity`, canvasElement.width - 400, canvasElement.height - 12)
}

export const writeDanceInformation = (canvasCtx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement, onBeat: boolean, grade: string): void => {
  canvasCtx.fillStyle = 'black'
  canvasCtx.font = '36px Poppins'
  canvasCtx.fillText(`${onBeat ? 'hit' : ''}`, canvasElement.width - 250, canvasElement.height / 2)

  canvasCtx.globalAlpha = 0.85
  canvasCtx.fillStyle = 'lightblue'
  canvasCtx.fillRect(canvasElement.width - 320, canvasElement.height / 2 + 40, 320, 96)

  canvasCtx.globalAlpha = 1.0
  canvasCtx.fillStyle = 'black'
  canvasCtx.fillText(grade, canvasElement.width - 300, canvasElement.height / 2 + 100)
}
