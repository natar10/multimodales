import { useEffect, useRef, useContext } from 'react'
import { SceneManager } from '../three/SceneManager.js'
import { AppContext } from '../context/AppContext.jsx'

export function useThreeScene(containerRef, video) {
  const sceneManagerRef = useRef(null)
  const {
    snapActive,
    clapActive,
    mirrorActive,
  } = useContext(AppContext)

  // Initialize SceneManager ONLY when video is ready
  useEffect(() => {
    if (!containerRef.current || !video) {
      console.log('⏳ Waiting for container and video...')
      return
    }

    console.log('🏗️ SceneManager creating with video ready...')
    const sceneManager = new SceneManager(containerRef.current, video)
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
      console.log('📡 Setting snap active to:', snapActive)
      manager.setSnapActive(snapActive)
    }
  }, [snapActive])

  useEffect(() => {
    const manager = sceneManagerRef.current
    if (manager) {
      console.log('📡 Setting clap active to:', clapActive)
      manager.setClapActive(clapActive)
    }
  }, [clapActive])

  useEffect(() => {
    const manager = sceneManagerRef.current
    if (manager) {
      console.log('📡 Setting mirror active to:', mirrorActive)
      manager.setMirrorActive(mirrorActive)
    }
  }, [mirrorActive])

  return sceneManagerRef
}
