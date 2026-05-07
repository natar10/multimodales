import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { keypointCenter, planeDimensions, PLANE_Z } from '../../utils/coordUtils.js'

const loader = new GLTFLoader()
const EMISSIVE_COLOR = new THREE.Color(0x00ff88)

// Configuracion desde .env (con fallbacks)
const EYE_COUNT     = parseInt(import.meta.env.VITE_EYE_COUNT)       || 15
const EYE_SCALE_MIN = parseFloat(import.meta.env.VITE_EYE_SCALE_MIN) || 40
const EYE_SCALE_MAX = parseFloat(import.meta.env.VITE_EYE_SCALE_MAX) || 700

const SMOOTH_FRAMES = 4

/**
 * Posiciones normalizadas fijas en [-0.5, 0.5] para X e Y.
 * Se multiplican por planeDimensions en update() para obtener world coords reales.
 * Distribucion en cuadricula 5x3 con offset alternado — cubre todo el frame.
 */
const NORMALIZED_POSITIONS = [
  // fila 0 (arriba)
  { nx: -0.45, ny:  0.42 },
  { nx: -0.22, ny:  0.45 },
  { nx:  0.00, ny:  0.40 },
  { nx:  0.23, ny:  0.44 },
  { nx:  0.46, ny:  0.41 },
  // fila 1 (centro)
  { nx: -0.46, ny:  0.02 },
  { nx: -0.20, ny: -0.05 },
  { nx:  0.01, ny:  0.08 },
  { nx:  0.22, ny: -0.03 },
  { nx:  0.45, ny:  0.05 },
  // fila 2 (abajo)
  { nx: -0.44, ny: -0.40 },
  { nx: -0.21, ny: -0.43 },
  { nx:  0.00, ny: -0.38 },
  { nx:  0.24, ny: -0.42 },
  { nx:  0.45, ny: -0.39 },
]

// scaleT y depthT deterministas por indice (no dependen de dimensiones del plano)
const EYE_META = Array.from({ length: EYE_COUNT }, (_, i) => {
  // scaleT cuadratico: mas ojos pequenos que grandes
  const t = i / Math.max(EYE_COUNT - 1, 1)
  const scaleT = t * t
  // depthT: alterna capas
  const depthT = ((i * 3 + 1) % EYE_COUNT) / Math.max(EYE_COUNT - 1, 1)
  return { scaleT, depthT }
})

export class ParallaxEffect {
  constructor() {
    this.group = new THREE.Group()
    this.eyes = []
    this.isActive = false
    this.posHistory = []
    this.smoothX = 0
    this.smoothY = 0
    this.time = 0
  }

  init(scene) {
    loader.load('/models/eye.glb', (gltf) => {
      const template = gltf.scene

      for (let i = 0; i < EYE_COUNT; i++) {
        const clone = template.clone(true)
        const pos = NORMALIZED_POSITIONS[i % NORMALIZED_POSITIONS.length]
        const meta = EYE_META[i]

        // Escala: de EYE_SCALE_MIN a EYE_SCALE_MAX con distribucion cuadratica
        const scale = EYE_SCALE_MIN + meta.scaleT * (EYE_SCALE_MAX - EYE_SCALE_MIN)

        // Profundidad: spread entre z=-12 y z=-8
        const baseZ = PLANE_Z + (-2.0 + meta.depthT * 4.0)

        // Parallax: ojos mas cercanos se mueven mas con la cara
        const parallaxStrength = 0.06 + meta.depthT * 0.20

        // Clonar materiales para animacion independiente
        const meshData = []
        clone.traverse((child) => {
          if (child.isMesh) {
            const mat = child.material.clone()
            if (mat.emissive !== undefined) {
              mat.emissive = EMISSIVE_COLOR
              mat.emissiveIntensity = 0.15
            }
            child.material = mat
            meshData.push({
              material: mat,
              phase: (i * 1.37 + 0.5) % (Math.PI * 2),
              freq: 0.3 + (i % 5) * 0.22,
            })
          }
        })

        clone.scale.setScalar(scale)
        // Posicion inicial con dimensiones por defecto — se corrige en el primer update()
        clone.position.set(
          pos.nx * planeDimensions.width,
          pos.ny * planeDimensions.height,
          baseZ
        )
        clone.visible = false

        this.eyes.push({ mesh: clone, pos, baseZ, parallaxStrength, meshData })
        this.group.add(clone)
      }

      console.log(`✅ ParallaxEffect: ${EYE_COUNT} ojos | escala ${EYE_SCALE_MIN.toFixed(0)}–${EYE_SCALE_MAX.toFixed(0)}`)
    }, undefined, (err) => console.error('❌ ParallaxEffect load error:', err))

    scene.add(this.group)
  }

  update(delta, faceDetections) {
    if (!this.isActive) return
    this.time += delta

    // Posicion suavizada de la cara en world coords
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
      // Posicion base usando dimensiones REALES del plano (actualizadas por SceneManager)
      const baseX = eye.pos.nx * planeDimensions.width
      const baseY = eye.pos.ny * planeDimensions.height

      // Parallax sutil: desplazamiento opuesto al movimiento de la cara
      const targetX = baseX - this.smoothX * eye.parallaxStrength
      const targetY = baseY - this.smoothY * eye.parallaxStrength

      eye.mesh.position.x += (targetX - eye.mesh.position.x) * 0.06
      eye.mesh.position.y += (targetY - eye.mesh.position.y) * 0.06
      eye.mesh.position.z = eye.baseZ

      // Rotacion lenta
      eye.mesh.rotation.y += delta * 0.4
      eye.mesh.rotation.x += delta * 0.12

      // Pulso de emision independiente por ojo
      for (const m of eye.meshData) {
        if (m.material.emissive !== undefined) {
          m.material.emissiveIntensity = 0.05 + 0.35 * (0.5 + 0.5 * Math.sin(this.time * m.freq + m.phase))
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
