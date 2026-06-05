import React from 'react'
import { CanvasOverlay } from './CanvasOverlay.jsx'
import { HUDOverlay } from './HUDOverlay.jsx'
import { MemeOverlay } from './MemeOverlay.jsx'
import { CalienteOverlay } from './CalienteOverlay.jsx'
import { ModalitiesPanel } from './ModalitiesPanel.jsx'
import '../styles/panel.css'

export function StreamLayout({ canvasRef }) {
  return (
    <div className="stream-layout">
      <div className="canvas-panel">
        <CanvasOverlay ref={canvasRef} />
        <HUDOverlay />
        <MemeOverlay />
        <CalienteOverlay />
      </div>
      <ModalitiesPanel />
    </div>
  )
}
