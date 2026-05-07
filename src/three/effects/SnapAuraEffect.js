import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { normalizedToWorld, keypointCenter, planeDimensions } from '../../utils/coordUtils.js'

const loader = new GLTFLoader()
// Cache desactivado para que este loader no interfiera con ParallaxEffect
loader.manager = new THREE.LoadingManager()

export class SnapAuraEffect {
  constructor() {
    this.chakraGroup = new THREE.Group()
    this.chakraMesh = null
    this.eyeMesh = null
    this.isActive = false
    this.time = 0
  }

  init(scene) {
    // --- Chakra GLB ---
    loader.load('/models/chakra.glb', (gltf) => {
      const chakra = gltf.scene
      chakra.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({
            color: 0xe5e556,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
          child.renderOrder = 2
        }
      })
      chakra.scale.setScalar(import.meta.env.VITE_SNAP_CHAKRA_SCALE)
      this.chakraMesh = chakra
      this.chakraGroup.add(chakra)
      console.log('✅ Chakra GLB loaded')
    }, undefined, (err) => console.error('❌ Chakra load error:', err))

    // --- Eye GLB ---
    loader.load('/models/eye.glb', (gltf) => {
      const eye = gltf.scene
      eye.traverse((child) => {
        if (child.isMesh) {
          child.renderOrder = 3
        }
      })
      eye.scale.setScalar(parseFloat(import.meta.env.VITE_SNAP_EYE_SCALE) || 35)
      // Rotar para que la pupila mire al frente (hacia la cámara)
      eye.rotation.y = parseFloat(import.meta.env.VITE_SNAP_EYE_ROTATION_Y) || Math.PI
      this.eyeMesh = eye
      this.chakraGroup.add(eye)
      console.log('✅ Eye GLB loaded')
    }, undefined, (err) => console.error('❌ Eye load error:', err))

    // Light for the eye
    const eyeLight = new THREE.PointLight(0xffffff, 3, 2)
    eyeLight.position.set(1, 0, 1.5)
    this.chakraGroup.add(eyeLight)

    this.chakraGroup.visible = false
    scene.add(this.chakraGroup)
    console.log('✅ SnapAuraEffect initialized')
  }

  update(delta, faceDetections) {
    this.time += delta

    if (this.isActive) {
      // Update forehead position from face detection
      if (faceDetections && faceDetections.length > 0) {
        const detection = faceDetections[0]
        const kps = detection.keypoints
        if (kps && kps.length >= 2) {
          const center = keypointCenter(kps[0], kps[1])
          const eyeToNoseY = kps.length >= 3 ? Math.abs(kps[2].y - center.y) : 0.04
          const foreheadOffset = eyeToNoseY * planeDimensions.height * 1.5
          const world = normalizedToWorld(center.x, center.y, 0.5)

          this.chakraGroup.position.x += (world.x - this.chakraGroup.position.x) * 0.15
          this.chakraGroup.position.y += ((world.y + foreheadOffset) - this.chakraGroup.position.y) * 0.15
          this.chakraGroup.position.z = world.z
        }
      }

      // Spin chakra
      if (this.chakraMesh) {
        this.chakraMesh.rotation.x -= delta * 0.8
        this.chakraMesh.rotation.y -= delta * 0.8
      }

      // Chakra fade in with pulse
      if (this.chakraMesh) {
        this.chakraMesh.traverse((child) => {
          if (child.isMesh) {
            child.material.opacity = Math.min(
              child.material.opacity + delta * 3,
              0.85 + 0.15 * Math.sin(this.time * 2)
            )
          }
        })
      }
    } else {
      // Fade out chakra
      if (this.chakraMesh) {
        this.chakraMesh.traverse((child) => {
          if (child.isMesh) {
            child.material.opacity = Math.max(0, child.material.opacity - delta * 3)
          }
        })
      }
    }
  }

  setActive(active) {
    this.isActive = active
    console.log('✨ SnapAuraEffect.setActive():', active)
    if (active) {
      this.time = 0
      this.chakraGroup.visible = true
    } else {
      setTimeout(() => {
        if (!this.isActive) this.chakraGroup.visible = false
      }, 1000)
    }
  }

  dispose() {
    this.chakraGroup.clear()
  }
}
