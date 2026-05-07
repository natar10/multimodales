import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { keypointCenter, planeDimensions, PLANE_Z } from '../../utils/coordUtils.js'

const loader = new GLTFLoader()
const EMISSIVE_COLOR = new THREE.Color(0x00ff88)

// Configuracion desde .env (con fallbacks)
const EYE_COUNT          = parseInt(import.meta.env.VITE_EYE_COUNT)           || 35
const EYE_SCALE_MIN      = parseFloat(import.meta.env.VITE_EYE_SCALE_MIN)     || 30
const EYE_SCALE_MAX      = parseFloat(import.meta.env.VITE_EYE_SCALE_MAX)     || 900
const PARALLAX_INTENSITY = parseFloat(import.meta.env.VITE_PARALLAX_INTENSITY) || 1.0

const SMOOTH_FRAMES = 4

/**
 * Hash determinista simple — devuelve un valor en [0, 1) para un indice dado.
 * Evita Math.random() para que las posiciones sean estables entre activaciones.
 */
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Genera metadatos para cada ojo usando hash determinista.
 * nx/ny en [-0.55, 0.55] — ligeramente fuera del borde para efecto de profundidad.
 */
function buildEyeMeta(count) {
  return Array.from({ length: count }, (_, i) => {
    // Posicion aleatoria cubriendo todo el frame + un poco fuera de los bordes
    const nx = -0.55 + hash(i * 3 + 0) * 1.10      // [-0.55, 0.55]
    const ny = -0.52 + hash(i * 3 + 1) * 1.04      // [-0.52, 0.52]

    // Escala: distribucion exponencial — muchos pequenos, pocos enormes
    const st = hash(i * 3 + 2)
    const scaleT = st * st * st                      // sesgo fuerte hacia pequenos

    // Profundidad: distribucion uniforme entre capas
    const depthT = hash(i * 7 + 5)

    // Fase y frecuencia de animacion
    const phase = hash(i * 11 + 3) * Math.PI * 2
    const freq  = 0.2 + hash(i * 13 + 7) * 1.0

    return { nx, ny, scaleT, depthT, phase, freq }
  })
}

export class ParallaxEffect {
  constructor() {
    this.group = new THREE.Group()
    this.eyes = []
    this.isActive = false
    this.posHistory = []
    this.smoothX = 0
    this.smoothY = 0
    this.time = 0
    this.meta = buildEyeMeta(EYE_COUNT)
  }

  init(scene) {
    loader.load('/models/eye.glb', (gltf) => {
      const template = gltf.scene

      for (let i = 0; i < EYE_COUNT; i++) {
        const clone = template.clone(true)
        const m = this.meta[i]

        // Escala exponencial: muchos ojos pequenos, pocos enormes
        const scale = EYE_SCALE_MIN + m.scaleT * (EYE_SCALE_MAX - EYE_SCALE_MIN)

        // Profundidad: spread entre z=-13 y z=-7
        const baseZ = PLANE_Z + (-3.0 + m.depthT * 6.0)

        // Parallax: ojos mas cercanos (depthT alto) se mueven mas
        const parallaxStrength = (0.04 + m.depthT * 0.22) * PARALLAX_INTENSITY

        // Clonar materiales
        const meshData = []
        clone.traverse((child) => {
          if (child.isMesh) {
            const mat = child.material.clone()
            if (mat.emissive !== undefined) {
              mat.emissive = EMISSIVE_COLOR
              mat.emissiveIntensity = 0.1
            }
            child.material = mat
            meshData.push({ material: mat, phase: m.phase, freq: m.freq })
          }
        })

        clone.scale.setScalar(scale)
        clone.position.set(
          m.nx * planeDimensions.width,
          m.ny * planeDimensions.height,
          baseZ
        )
        clone.visible = false

        this.eyes.push({ mesh: clone, meta: m, baseZ, parallaxStrength, meshData })
        this.group.add(clone)
      }

      console.log(`✅ ParallaxEffect: ${EYE_COUNT} ojos | escala ${EYE_SCALE_MIN}–${EYE_SCALE_MAX}`)
    }, undefined, (err) => console.error('❌ ParallaxEffect load error:', err))

    scene.add(this.group)
  }

  update(delta, faceDetections) {
    if (!this.isActive) return
    this.time += delta

    // Posicion suavizada de la cara
    if (faceDetections && faceDetections.length > 0) {
      const kps = faceDetections[0].keypoints
      if (kps && kps.length >= 2) {
        const center = keypointCenter(kps[0], kps[1])
        const wx = (0.5 - center.x) * planeDimensions.width
        const wy = (0.5 - center.y) * planeDimensions.height

        this.posHistory.push({ x: wx, y: wy })
        if (this.posHistory.length > SMOOTH_FRAMES) this.posHistory.shift()

        const sum = this.posHistory.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 })
        this.smoothX = sum.x / this.posHistory.length
        this.smoothY = sum.y / this.posHistory.length
      }
    }

    for (const eye of this.eyes) {
      // Posicion base con dimensiones reales del plano (actualizadas cada frame)
      const baseX = eye.meta.nx * planeDimensions.width
      const baseY = eye.meta.ny * planeDimensions.height

      // Parallax: desplazamiento opuesto al movimiento de la cara
      const targetX = baseX - this.smoothX * eye.parallaxStrength
      const targetY = baseY - this.smoothY * eye.parallaxStrength

      eye.mesh.position.x += (targetX - eye.mesh.position.x) * 0.05
      eye.mesh.position.y += (targetY - eye.mesh.position.y) * 0.05
      eye.mesh.position.z = eye.baseZ

      // Rotacion lenta e independiente
      eye.mesh.rotation.y += delta * (0.2 + eye.meta.depthT * 0.5)
      eye.mesh.rotation.x += delta * 0.08

      // Pulso de emision
      for (const md of eye.meshData) {
        if (md.material.emissive !== undefined) {
          md.material.emissiveIntensity = 0.05 + 0.3 * (0.5 + 0.5 * Math.sin(this.time * md.freq + md.phase))
        }
      }
    }
  }

  setActive(active) {
    this.isActive = active
    for (const eye of this.eyes) {
      eye.mesh.visible = active
    }
    if (!active) {
      this.posHistory = []
      this.smoothX = 0
      this.smoothY = 0
    }
    console.log('👁️ ParallaxEffect.setActive():', active)
  }

  dispose() {
    this.group.clear()
    this.eyes = []
  }
}
