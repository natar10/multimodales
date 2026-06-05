import React, { useContext, useEffect, useRef } from 'react'
import { AppContext } from '../context/AppContext.jsx'

export function CalienteOverlay() {
  const { calienteActive } = useContext(AppContext)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio('/explosion.mp3')
    audio.preload = 'auto'
    audioRef.current = audio
  }, [])

  useEffect(() => {
    if (calienteActive && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [calienteActive])

  if (!calienteActive) return null

  return (
    <div className="caliente-overlay">
      <img src="/hot.png" alt="HOT!" className="caliente-img" />
    </div>
  )
}
