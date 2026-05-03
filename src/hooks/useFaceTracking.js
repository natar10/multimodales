import { useEffect, useRef, useContext } from 'react'
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'
import { AppContext } from '../context/AppContext.jsx'

export function useFaceTracking(video, shouldInitialize) {
  const faceDetectorRef = useRef(null)
  const { faceLandmarksRef } = useContext(AppContext)
  const isInitializingRef = useRef(false)
  const frameCountRef = useRef(0)
  const animFrameRef = useRef(null)

  useEffect(() => {
    if (!video || !shouldInitialize) {
      // Cleanup when not needed
      if (faceDetectorRef.current) {
        console.log('🧹 Closing FaceDetector')
        faceDetectorRef.current.close()
        faceDetectorRef.current = null
        faceLandmarksRef.current = null
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

        const faceDetector = await FaceDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
          minSuppressionThreshold: 0.3,
        })

        faceDetectorRef.current = faceDetector
        console.log('✅ FaceDetector initialized')

        // Detection loop — every 2 frames for performance
        const detectionLoop = () => {
          if (!faceDetectorRef.current) return

          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            frameCountRef.current++
            if (frameCountRef.current % 2 === 0) {
              try {
                const result = faceDetectorRef.current.detectForVideo(video, performance.now())
                // result.detections[i].keypoints:
                //   0: left eye, 1: right eye, 2: nose, 3: mouth, 4: left ear, 5: right ear
                faceLandmarksRef.current = result.detections ?? []
              } catch (err) {
                console.error('FaceDetector error:', err)
              }
            }
          }

          animFrameRef.current = requestAnimationFrame(detectionLoop)
        }

        detectionLoop()
      } catch (err) {
        console.error('❌ FaceDetector init failed:', err)
        isInitializingRef.current = false
      }
    }

    initialize()

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (faceDetectorRef.current) {
        faceDetectorRef.current.close()
        faceDetectorRef.current = null
        faceLandmarksRef.current = null
      }
      isInitializingRef.current = false
    }
  }, [video, shouldInitialize, faceLandmarksRef])
}
