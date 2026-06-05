import { useEffect, useRef, useContext } from 'react'
import { SceneManager } from '../three/SceneManager.js'
import { AppContext } from '../context/AppContext.jsx'

export function useThreeScene(containerRef, video) {
  const sceneManagerRef = useRef(null)
  const {
    snapActive,
    spiderSenseActive,
    verticalHandActive,
    handLandmarksRef,
    faceLandmarksRef,
  } = useContext(AppContext)

  useEffect(() => {
    if (!containerRef.current || !video) return

    const sceneManager = new SceneManager(containerRef.current, video)
    sceneManager.setFaceDetectionsRef(faceLandmarksRef)
    sceneManager.setHandDetectionsRef(handLandmarksRef)
    sceneManager.init()
    sceneManager.start()
    sceneManagerRef.current = sceneManager

    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose()
        sceneManagerRef.current = null
      }
    }
  }, [containerRef, video])

  useEffect(() => {
    sceneManagerRef.current?.setSnapActive(snapActive)
  }, [snapActive])

  useEffect(() => {
    sceneManagerRef.current?.setSpiderSenseActive(spiderSenseActive)
  }, [spiderSenseActive])

  useEffect(() => {
    sceneManagerRef.current?.setPortalActive(verticalHandActive)
  }, [verticalHandActive])

  return sceneManagerRef
}
