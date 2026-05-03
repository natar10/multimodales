import React, { createContext, useState, useRef } from 'react'

export const AppContext = createContext()

export function AppProvider({ children }) {
  // Efectos activos (booleanos que disparan renders)
  const [snapActive, setSnapActive] = useState(false)
  const [clapActive, setClapActive] = useState(false)
  const [mirrorActive, setMirrorActive] = useState(false)
  const [spiderSenseActive, setSpiderSenseActive] = useState(false)
  const [portalPosterIndex, setPortalPosterIndex] = useState(0)

  // Landmarks (NO useState — refs para evitar re-renders a 30fps)
  const handLandmarksRef = useRef(null)
  const faceLandmarksRef = useRef(null)

  const value = {
    snapActive,
    setSnapActive,
    clapActive,
    setClapActive,
    mirrorActive,
    setMirrorActive,
    spiderSenseActive,
    setSpiderSenseActive,
    portalPosterIndex,
    setPortalPosterIndex,
    handLandmarksRef,
    faceLandmarksRef,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
