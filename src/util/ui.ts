import { intensity } from './scores'

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
