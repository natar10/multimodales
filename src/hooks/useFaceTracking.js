import { useEffect, useRef, useContext } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { AppContext } from '../context/AppContext.jsx'
import { expressionDetector } from '../gestures/expressionDetector.js'

const MEME_PRIORITY = ['risaMalevola', 'sorprendido', 'preocupado', 'smug']

const MEME_DETECTORS = {
  risaMalevola: (b) => expressionDetector.detectRisaMalevola(b),
  sorprendido:  (b) => expressionDetector.detectSorprendido(b),
  preocupado:   (b) => expressionDetector.detectPreocupado(b),
  smug:         (b) => expressionDetector.detectSmug(b),
}

export function useFaceTracking(video, shouldInitialize) {
  const faceLandmarkerRef     = useRef(null)
  const isInitializingRef     = useRef(false)
  const frameCountRef         = useRef(0)
  const animFrameRef          = useRef(null)

  // Spider sense
  const expressionHoldStartRef    = useRef(null)
  const prevExpressionRef         = useRef('neutral')
  const spiderSenseHistoryFiredRef = useRef(false)

  // Meme overlay
  const memeHoldExprRef    = useRef(null)
  const memeHoldStartRef   = useRef(null)
  const memeDisplayTimerRef = useRef(null)
  const memeDisplayingRef  = useRef(false)

  const {
    faceLandmarksRef, faceBlendshapesRef,
    setSpiderSenseActive, setActiveMeme,
    setCurrentExpressionLabel, addHistoryEvent,
  } = useContext(AppContext)

  const SPIDER_SENSE_HOLD_MS = parseInt(import.meta.env.VITE_SPIDER_SENSE_HOLD_MS) || 50
  const MEME_DISPLAY_MS      = parseInt(import.meta.env.VITE_MEME_DISPLAY_MS)      || 1500
  const MEME_DEBOUNCE_MS     = parseInt(import.meta.env.VITE_MEME_DEBOUNCE_MS)     || 500

  useEffect(() => {
    if (!video || !shouldInitialize) {
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

                    // --- Spider Sense ---
                    const isAmazed = expressionDetector.detectAmazement(blendshapes, frameCountRef.current)

                    if (isAmazed) {
                      if (expressionHoldStartRef.current === null) {
                        expressionHoldStartRef.current = performance.now()
                      } else if (performance.now() - expressionHoldStartRef.current >= SPIDER_SENSE_HOLD_MS) {
                        setSpiderSenseActive(true)
                        if (!spiderSenseHistoryFiredRef.current) {
                          spiderSenseHistoryFiredRef.current = true
                          addHistoryEvent({ label: 'Spider Sense activado', icon: '⚡' })
                        }
                      }
                    } else {
                      expressionHoldStartRef.current = null
                      spiderSenseHistoryFiredRef.current = false
                      setSpiderSenseActive(false)
                    }

                    // --- Meme Overlay ---
                    let detectedMemeExpr = null
                    if (!memeDisplayingRef.current) {
                      for (const key of MEME_PRIORITY) {
                        if (MEME_DETECTORS[key](blendshapes)) { detectedMemeExpr = key; break }
                      }
                    }

                    if (detectedMemeExpr) {
                      if (memeHoldExprRef.current !== detectedMemeExpr) {
                        memeHoldExprRef.current  = detectedMemeExpr
                        memeHoldStartRef.current = performance.now()
                      } else if (performance.now() - memeHoldStartRef.current >= MEME_DEBOUNCE_MS) {
                        memeDisplayingRef.current = true
                        memeHoldExprRef.current   = null
                        memeHoldStartRef.current  = null
                        setActiveMeme(detectedMemeExpr)
                        addHistoryEvent({ label: `Meme: ${detectedMemeExpr}`, icon: '😂' })
                        if (memeDisplayTimerRef.current) clearTimeout(memeDisplayTimerRef.current)
                        memeDisplayTimerRef.current = setTimeout(() => {
                          setActiveMeme(null)
                          memeDisplayingRef.current = false
                        }, MEME_DISPLAY_MS)
                      }
                    } else if (!memeDisplayingRef.current) {
                      memeHoldExprRef.current  = null
                      memeHoldStartRef.current = null
                    }

                    // --- HUD label ---
                    const exprLabel = isAmazed
                      ? 'asombro'
                      : (memeDisplayingRef.current || detectedMemeExpr)
                        ? (memeHoldExprRef.current ?? prevExpressionRef.current)
                        : 'neutral'
                    if (prevExpressionRef.current !== exprLabel) {
                      prevExpressionRef.current = exprLabel
                      setCurrentExpressionLabel(exprLabel)
                    }
                  }
                } else {
                  faceLandmarksRef.current   = null
                  faceBlendshapesRef.current = null
                  setSpiderSenseActive(false)
                  if (prevExpressionRef.current !== 'neutral') {
                    prevExpressionRef.current = 'neutral'
                    setCurrentExpressionLabel('neutral')
                  }
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
      if (memeDisplayTimerRef.current) clearTimeout(memeDisplayTimerRef.current)
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close()
        faceLandmarkerRef.current = null
        faceLandmarksRef.current = null
        faceBlendshapesRef.current = null
      }
      isInitializingRef.current = false
    }
  }, [video, shouldInitialize, faceLandmarksRef, faceBlendshapesRef, setSpiderSenseActive,
      setActiveMeme, setCurrentExpressionLabel, addHistoryEvent])
}
