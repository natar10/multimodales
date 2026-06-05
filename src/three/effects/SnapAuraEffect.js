import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { normalizedToWorld } from '../../utils/coordUtils.js'

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
    }, undefined, (err) => console.error('❌ Eye load error:', err))

    // Light for the eye
    const eyeLight = new THREE.PointLight(0xffffff, 3, 2)
    eyeLight.position.set(1, 0, 1.5)
    this.chakraGroup.add(eyeLight)

    this.chakraGroup.visible = false
    scene.add(this.chakraGroup)
  }

  update(delta, faceLandmarks) {
    this.time += delta

    if (this.isActive) {
      // Posicionar el chakra en el centro de la frente (tercer ojo)
      // Landmark 168: glabella (entre las cejas)
      // Landmark 10:  cima de la cabeza
      // Tercer ojo = 35% del camino desde la glabella hacia la cima
      if (faceLandmarks && faceLandmarks[168] && faceLandmarks[10]) {
        const glabella = faceLandmarks[168]
        const topHead  = faceLandmarks[10]

        const tx = glabella.x + (topHead.x - glabella.x) * 0.35
        const ty = glabella.y + (topHead.y - glabella.y) * 0.35
        const world = normalizedToWorld(tx, ty, 0.5)

        this.chakraGroup.position.x += (world.x - this.chakraGroup.position.x) * 0.15
        this.chakraGroup.position.y += (world.y - this.chakraGroup.position.y) * 0.15
        this.chakraGroup.position.z = world.z
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
