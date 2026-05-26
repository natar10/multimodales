import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import '../styles/panel.css'

const MEME_IMAGES = {
  sorprendido:  '/memes/sorprendido.png',
  risaMalevola: '/memes/risaMalevola.png',
  preocupado:   '/memes/preocupado.png',
  smug:         '/memes/smug.png',
}

export function MemeOverlay() {
  const { activeMeme } = useContext(AppContext)
  if (!activeMeme) return null

  return (
    <div className="meme-overlay" key={activeMeme}>
      <div className="meme-bubble">
        <img src={MEME_IMAGES[activeMeme]} alt={activeMeme} className="meme-img" />
      </div>
    </div>
  )
}
