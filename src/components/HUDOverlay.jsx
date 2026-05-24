import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import '../styles/panel.css'

export function HUDOverlay() {
  const {
    snapActive, spiderSenseActive,
    chismeListening, chismeActive,
    currentGestureLabel, currentExpressionLabel,
  } = useContext(AppContext)

  const gestureActive = !!currentGestureLabel || snapActive
  const voiceActive = chismeListening || chismeActive
  const voiceCrimson = chismeActive

  const gestureText = currentGestureLabel
    ? currentGestureLabel
    : snapActive
    ? 'triángulo'
    : 'sin gesto'

  const voiceText = chismeActive
    ? '¡chisme!'
    : chismeListening
    ? 'escuchando'
    : 'silencio'

  return (
    <div className="hud-overlay">
      <div className={`hud-chip ${gestureActive ? 'active' : ''}`}>
        <span className="hud-chip-dot" />
        ✋ {gestureText}
      </div>
      <div className={`hud-chip ${spiderSenseActive ? 'active-crimson' : ''}`}>
        <span className="hud-chip-dot" />
        😮 {currentExpressionLabel ?? 'neutral'}
      </div>
      <div className={`hud-chip ${voiceActive ? (voiceCrimson ? 'active-crimson' : 'active') : ''}`}>
        <span className="hud-chip-dot" />
        🎤 {voiceText}
      </div>
    </div>
  )
}
