import { useEffect, useRef, useContext } from 'react'
import { SceneManager } from '../three/SceneManager.js'
import { AppContext } from '../context/AppContext.jsx'

export function useThreeScene(containerRef, video) {
  const sceneManagerRef = useRef(null)
  const {
    snapActive,
    clapActive,
    mirrorActive,
    spiderSenseActive,
    faceLandmarksRef,
  } = useContext(AppContext)

  // Initialize SceneManager ONLY when video is ready
  useEffect(() => {
    if (!containerRef.current || !video) {
      console.log('⏳ Waiting for container and video...')
      return
    }

    console.log('🏗️ SceneManager creating with video ready...')
    const sceneManager = new SceneManager(containerRef.current, video)
    sceneManager.setFaceDetectionsRef(faceLandmarksRef)
    sceneManager.init()
    console.log('▶️ SceneManager init complete, calling start()...')
    sceneManager.start()
    sceneManagerRef.current = sceneManager
    console.log('✅ SceneManager ready')

    return () => {
      console.log('🧹 Disposing SceneManager')
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose()
        sceneManagerRef.current = null
      }
    }
  }, [containerRef, video]) // Re-run if video changes

  // Update effects based on state changes
  useEffect(() => {
    const manager = sceneManagerRef.current
    if (manager) {
      manager.setSnapActive(snapActive)
    }
  }, [snapActive])

  useEffect(() => {
    const manager = sceneManagerRef.current
    if (manager) {
      manager.setClapActive(clapActive)
    }
  }, [clapActive])

  useEffect(() => {
    const manager = sceneManagerRef.current
    if (manager) {
      manager.setMirrorActive(mirrorActive)
    }
  }, [mirrorActive])

  useEffect(() => {
    const manager = sceneManagerRef.current
    if (manager) {
      manager.setSpiderSenseActive(spiderSenseActive)
    }
  }, [spiderSenseActive])

  return sceneManagerRef
}
