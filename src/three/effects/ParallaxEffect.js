import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { keypointCenter, planeDimensions, PLANE_Z } from '../../utils/coordUtils.js'

const loader = new GLTFLoader()
const EMISSIVE_COLOR = new THREE.Color(0x00ff88)

// Configuracion desde .env (con fallbacks)
const EYE_COUNT     = parseInt(import.meta.env.VITE_EYE_COUNT)     || 15
const EYE_SCALE_MIN = parseFloat(import.meta.env.VITE_EYE_SCALE_MIN) || 40
const EYE_SCALE_MAX = parseFloat(import.meta.env.VITE_EYE_SCALE_MAX) || 700

const SMOOTH_FRAMES = 4

/**
 * Genera posiciones distribuidas por todo el canvas usando una cuadricula
 * irregular con offset alternado por fila. Determinista (sin Math.random)
 * para que los ojos no salten al reactivar el efecto.
 */
function buildSeeds(count) {
  const seeds = []
  const cols = 5
  const rows = Math.ceil(count / cols)

  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    // Espacio normalizado [-0.48, 0.48] en X, [-0.45, 0.45] en Y
    const nx = -0.48 + (col / (cols - 1)) * 0.96 + (row % 2) * 0.09
    const ny = rows > 1 ? -0.45 + (row / (rows - 1)) * 0.90 : 0

    // scaleT: distribucion no lineal — mas ojos pequenos que grandes
    // Usamos cuadrado para sesgar hacia valores bajos
    const t = i / (count - 1)
    const scaleT = t * t   // 0 → 1 cuadratico

    // depthT: alterna capas de profundidad
    const depthT = ((i * 3 + 1) % count) / (count - 1)

    seeds.push({ nx, ny, scaleT, depthT })
  }
  return seeds
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
    this.seeds = buildSeeds(EYE_COUNT)
  }

  init(scene) {
    loader.load('/models/eye.glb', (gltf) => {
      const template = gltf.scene

      for (let i = 0; i < EYE_COUNT; i++) {
        const clone = template.clone(true)
        const seed = this.seeds[i]

        // Escala: de EYE_SCALE_MIN (pequeno) a EYE_SCALE_MAX (enorme)
        const scale = EYE_SCALE_MIN + seed.scaleT * (EYE_SCALE_MAX - EYE_SCALE_MIN)

        // Profundidad: spread entre z=-12 y z=-8 (delante y detras del plano de video)
        const baseZ = PLANE_Z + (-2.0 + seed.depthT * 4.0)

        // Parallax: ojos mas cercanos (z mayor) se mueven mas
        const parallaxStrength = 0.06 + seed.depthT * 0.20

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
        // Posicion inicial — se recalcula en update() con dimensiones reales del plano
        clone.position.set(
          seed.nx * planeDimensions.width,
          seed.ny * planeDimensions.height,
          baseZ
        )
        clone.visible = false

        this.eyes.push({ mesh: clone, seed, baseZ, parallaxStrength, meshData })
        this.group.add(clone)
      }

      console.log(`✅ ParallaxEffect: ${EYE_COUNT} ojos | escala ${EYE_SCALE_MIN}–${EYE_SCALE_MAX}`)
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
      // Posicion base distribuida por todo el canvas
      const baseX = eye.seed.nx * planeDimensions.width
      const baseY = eye.seed.ny * planeDimensions.height

      // Parallax: desplazamiento sutil opuesto al movimiento de la cara
      const targetX = baseX - this.smoothX * eye.parallaxStrength
      const targetY = baseY - this.smoothY * eye.parallaxStrength

      eye.mesh.position.x += (targetX - eye.mesh.position.x) * 0.06
      eye.mesh.position.y += (targetY - eye.mesh.position.y) * 0.06
      eye.mesh.position.z = eye.baseZ

      // Rotacion lenta
      eye.mesh.rotation.y += delta * 0.4
      eye.mesh.rotation.x += delta * 0.12

      // Pulso de emision independiente
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
