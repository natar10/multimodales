import React, { createContext, useState, useRef, useCallback } from 'react'

export const AppContext = createContext()

export function AppProvider({ children }) {
  // Efectos activos (booleanos que disparan renders)
  const [snapActive, setSnapActive] = useState(false)
  const [mirrorActive, setMirrorActive] = useState(false)
  const [spiderSenseActive, setSpiderSenseActive] = useState(false)
  const [portalPosterIndex, setPortalPosterIndex] = useState(0)
  const [chismeListening, setChismeListening] = useState(false)
  const [chismeActive, setChismeActive] = useState(false)
  const [verticalHandActive, setVerticalHandActive] = useState(false)

  // Meme overlay
  const [activeMeme, setActiveMeme] = useState(null)

  // UI feedback state
  const [currentGestureLabel, setCurrentGestureLabel] = useState(null)
  const [currentExpressionLabel, setCurrentExpressionLabel] = useState('neutral')
  const [eventHistory, setEventHistory] = useState([])

  const addHistoryEvent = useCallback(({ label, icon }) => {
    setEventHistory(prev =>
      [{ id: Date.now(), label, icon, timestamp: new Date() }, ...prev].slice(0, 5)
    )
  }, [])

  // Landmarks (NO useState — refs para evitar re-renders a 30fps)
  const handLandmarksRef = useRef(null)
  const faceLandmarksRef = useRef(null)
  const faceBlendshapesRef = useRef(null)

  const value = {
    snapActive,
    setSnapActive,
    mirrorActive,
    setMirrorActive,
    spiderSenseActive,
    setSpiderSenseActive,
    portalPosterIndex,
    setPortalPosterIndex,
    verticalHandActive,
    setVerticalHandActive,
    handLandmarksRef,
    faceLandmarksRef,
    faceBlendshapesRef,
    chismeListening,
    setChismeListening,
    chismeActive,
    setChismeActive,
    activeMeme,
    setActiveMeme,
    currentGestureLabel,
    setCurrentGestureLabel,
    currentExpressionLabel,
    setCurrentExpressionLabel,
    eventHistory,
    addHistoryEvent,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
