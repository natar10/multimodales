import React, { forwardRef } from 'react'

export const CanvasOverlay = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    />
  )
})

CanvasOverlay.displayName = 'CanvasOverlay'
