import { useRef, useState } from 'react'
import { getUserInfo } from './User'

export default function BeatsMeMain (): JSX.Element {

  getUserInfo()

  return (
    <>
    hi
    </>
  )
}
