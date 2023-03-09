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
  canvasCtx.fillText(`bpm: ${bpm} | high intensity`, canvasElement.width - 400, canvasElement.height - 12)
}

export const writeDanceInformation = (canvasCtx: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement, onBeat: boolean, grade: string): void => {
  canvasCtx.fillStyle = 'black'
  canvasCtx.font = '36px Poppins'
  canvasCtx.fillText(`${onBeat ? 'dance' : ''}`, canvasElement.width - 200, canvasElement.height / 2)
  canvasCtx.fillText(`${onBeat ? grade : ''}`, canvasElement.width - 200, canvasElement.height / 2 + 200)
}
