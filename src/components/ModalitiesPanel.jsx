import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import '../styles/panel.css'

function formatTime(date) {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function ModalityCard({ icon, name, value, active, variant }) {
  const classes = [
    'modality-card',
    active && variant === 'crimson' ? 'active-crimson' : active ? 'active' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <span className="modality-icon">{icon}</span>
      <div className="modality-info">
        <div className="modality-name">{name}</div>
        <div className="modality-value">{value}</div>
      </div>
    </div>
  )
}

export function ModalitiesPanel() {
  const {
    snapActive,
    spiderSenseActive,
    chismeListening,
    chismeActive,
    currentGestureLabel,
    currentExpressionLabel,
    eventHistory,
  } = useContext(AppContext)

  const gestureActive = !!currentGestureLabel || snapActive
  const gestureValue = currentGestureLabel
    ? currentGestureLabel
    : snapActive
    ? 'triángulo (activo)'
    : 'sin gesto'

  const voiceActive = chismeListening || chismeActive
  const voiceValue = chismeActive
    ? '¡chisme detectado!'
    : chismeListening
    ? 'escuchando...'
    : 'en silencio'

  return (
    <div className="modalities-panel">
      <div className="panel-corner tl" />
      <div className="panel-corner tr" />
      <div className="panel-corner bl" />
      <div className="panel-corner br" />

      <div className="panel-header">
        <div className="panel-title">MoveStream</div>
        <div className="panel-subtitle">Arcane Overlay System</div>
      </div>

      <div className="panel-body">
        <div>
          <div className="section-label">Modalidades Activas</div>
          <div className="arcane-divider" />
          <div className="modality-cards">
            <ModalityCard
              icon="✋"
              name="Gestos"
              value={gestureValue}
              active={gestureActive}
            />
            <ModalityCard
              icon="🎤"
              name="Voz"
              value={voiceValue}
              active={voiceActive}
              variant="crimson"
            />
            <ModalityCard
              icon="😮"
              name="Expresión Facial"
              value={currentExpressionLabel ?? 'neutral'}
              active={spiderSenseActive}
              variant="crimson"
            />
          </div>
        </div>

        <div>
          <div className="section-label">Historial Reciente</div>
          <div className="arcane-divider" />
          <div className="history-list">
            {eventHistory.length === 0 ? (
              <div className="history-empty">Sin eventos aún...</div>
            ) : (
              eventHistory.map(entry => (
                <div key={entry.id} className="history-entry">
                  <span className="history-entry-icon">{entry.icon}</span>
                  <span className="history-entry-label">{entry.label}</span>
                  <span className="history-entry-time">{formatTime(entry.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
