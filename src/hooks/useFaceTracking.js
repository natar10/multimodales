import { useEffect, useRef, useContext } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { AppContext } from '../context/AppContext.jsx'
import { expressionDetector } from '../gestures/expressionDetector.js'

export function useFaceTracking(video, shouldInitialize) {
  const faceLandmarkerRef = useRef(null)
  const { faceLandmarksRef, faceBlendshapesRef, setSpiderSenseActive } = useContext(AppContext)
  const isInitializingRef = useRef(false)
  const frameCountRef = useRef(0)
  const animFrameRef = useRef(null)

  useEffect(() => {
    if (!video || !shouldInitialize) {
      // Cleanup when not needed
      if (faceLandmarkerRef.current) {
        console.log('🧹 Closing FaceLandmarker')
        faceLandmarkerRef.current.close()
        faceLandmarkerRef.current = null
        faceLandmarksRef.current = null
        faceBlendshapesRef.current = null
        isInitializingRef.current = false
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current)
          animFrameRef.current = null
        }
      }
      return
    }

    if (isInitializingRef.current) return
    isInitializingRef.current = true

    const initialize = async () => {
      try {
        const wasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        const filesetResolver = await FilesetResolver.forVisionTasks(wasmPath)

        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
        })

        faceLandmarkerRef.current = faceLandmarker
        console.log('✅ FaceLandmarker initialized')

        // Detection loop — every 2 frames for performance
        const detectionLoop = () => {
          if (!faceLandmarkerRef.current) return

          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            frameCountRef.current++
            if (frameCountRef.current % 2 === 0) {
              try {
                const result = faceLandmarkerRef.current.detectForVideo(video, performance.now())
                
                if (result.faceLandmarks && result.faceLandmarks.length > 0) {
                  faceLandmarksRef.current = result.faceLandmarks[0]
                  
                  if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
                    const blendshapes = result.faceBlendshapes[0].categories
                    faceBlendshapesRef.current = blendshapes

                    // Detect Amazement Expression
                    const isAmazed = expressionDetector.detectAmazement(blendshapes, frameCountRef.current)
                    setSpiderSenseActive(isAmazed)
                  }
                } else {
                  faceLandmarksRef.current = null
                  faceBlendshapesRef.current = null
                  setSpiderSenseActive(false)
                }
              } catch (err) {
                console.error('FaceLandmarker error:', err)
              }
            }
          }

          animFrameRef.current = requestAnimationFrame(detectionLoop)
        }

        detectionLoop()
      } catch (err) {
        console.error('❌ FaceLandmarker init failed:', err)
        isInitializingRef.current = false
      }
    }

    initialize()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close()
        faceLandmarkerRef.current = null
        faceLandmarksRef.current = null
        faceBlendshapesRef.current = null
      }
      isInitializingRef.current = false
    }
  }, [video, shouldInitialize, faceLandmarksRef, faceBlendshapesRef, setSpiderSenseActive])
}
