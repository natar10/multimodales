import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { keypointCenter, planeDimensions, PLANE_Z } from '../../utils/coordUtils.js'

const loader = new GLTFLoader()
// Cache desactivado para que este loader no interfiera con otros efectos
// que carguen el mismo modelo (ej: SnapAuraEffect)
loader.manager = new THREE.LoadingManager()

// Configuracion desde .env
const EYE_COUNT          = parseInt(import.meta.env.VITE_EYE_COUNT)            || 35
const EYE_SCALE_MIN      = parseFloat(import.meta.env.VITE_EYE_SCALE_MIN)      || 30
const EYE_SCALE_MAX      = parseFloat(import.meta.env.VITE_EYE_SCALE_MAX)      || 900
const PARALLAX_INTENSITY = parseFloat(import.meta.env.VITE_PARALLAX_INTENSITY) || 1.0
const SMOOTH_FRAMES      = 4

// ─── Glow texture ─────────────────────────────────────────────────────────────
// Gradiente radial: núcleo blanco → verde-cyan → niebla → transparente
function createGlowTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2
  const g = ctx.createRadialGradient(c, c, 0, c, c, c)
  g.addColorStop(0.00, 'rgba(255, 255, 255, 0.90)')
  g.addColorStop(0.18, 'rgba(100, 255, 210, 0.70)')
  g.addColorStop(0.45, 'rgba(0,   190, 150, 0.35)')
  g.addColorStop(0.75, 'rgba(0,   110,  90, 0.10)')
  g.addColorStop(1.00, 'rgba(0,     0,   0, 0.00)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

let glowTexture = null

// ─── Hash determinista ────────────────────────────────────────────────────────
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function buildEyeMeta(count) {
  return Array.from({ length: count }, (_, i) => ({
    nx:     -0.55 + hash(i * 3 + 0) * 1.10,
    ny:     -0.52 + hash(i * 3 + 1) * 1.04,
    scaleT: Math.pow(hash(i * 3 + 2), 3),
    depthT: hash(i * 7 + 5),
    phase:  hash(i * 11 + 3) * Math.PI * 2,
    freq:   0.2 + hash(i * 13 + 7) * 1.0,
  }))
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
    if (!glowTexture) glowTexture = createGlowTexture()

    loader.load('/models/eye.glb', (gltf) => {
      const template = gltf.scene

      for (let i = 0; i < EYE_COUNT; i++) {
        const m = this.meta[i]
        const scale = EYE_SCALE_MIN + m.scaleT * (EYE_SCALE_MAX - EYE_SCALE_MIN)
        const baseZ = PLANE_Z + (-3.0 + m.depthT * 6.0)
        const parallaxStrength = (0.04 + m.depthT * 0.22) * PARALLAX_INTENSITY

        // ── Halo: sprite billboard con blending aditivo ───────────────────────
        const haloMat = new THREE.SpriteMaterial({
          map: glowTexture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false,    // no bloquea el depth buffer → el ojo se ve encima
          opacity: 0.75,
        })
        const halo = new THREE.Sprite(haloMat)
        halo.renderOrder = 1
        halo.scale.set(scale * 0.022, scale * 0.022, 1)
        halo.position.set(0, 0, 0)

        // ── Ojo: modelo original sin modificar materiales ─────────────────────
        const clone = template.clone(true)
        clone.scale.setScalar(scale)
        clone.position.set(0, 0, 0)
        clone.traverse((child) => {
          if (child.isMesh) child.renderOrder = 2
        })

        // ── Grupo: contiene halo + ojo ────────────────────────────────────────
        const eyeGroup = new THREE.Group()
        eyeGroup.add(halo)
        eyeGroup.add(clone)
        eyeGroup.position.set(
          m.nx * planeDimensions.width,
          m.ny * planeDimensions.height,
          baseZ
        )
        eyeGroup.visible = false

        this.eyes.push({ group: eyeGroup, mesh: clone, haloMat, meta: m, baseZ, parallaxStrength })
        this.group.add(eyeGroup)
      }

      console.log(`✅ ParallaxEffect: ${EYE_COUNT} ojos | escala ${EYE_SCALE_MIN}–${EYE_SCALE_MAX}`)
    }, undefined, (err) => console.error('❌ ParallaxEffect load error:', err))

    scene.add(this.group)
  }

  update(delta, faceDetections) {
    if (!this.isActive) return
    this.time += delta

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
      const baseX = eye.meta.nx * planeDimensions.width
      const baseY = eye.meta.ny * planeDimensions.height
      const targetX = baseX - this.smoothX * eye.parallaxStrength
      const targetY = baseY - this.smoothY * eye.parallaxStrength

      eye.group.position.x += (targetX - eye.group.position.x) * 0.15
      eye.group.position.y += (targetY - eye.group.position.y) * 0.15
      eye.group.position.z = eye.baseZ

      eye.mesh.rotation.y += delta * (0.2 + eye.meta.depthT * 0.5)
      eye.mesh.rotation.x += delta * 0.08

      // Pulso suave del halo
      eye.haloMat.opacity = 0.45 + 0.30 * Math.sin(this.time * eye.meta.freq + eye.meta.phase)
    }
  }

  setActive(active, faceDetections) {
    this.isActive = active
    if (active) {
      // Pre-llenar el historial con la posición actual de la cara
      // para evitar el salto brusco en el primer frame
      if (faceDetections && faceDetections.length > 0) {
        const kps = faceDetections[0].keypoints
        if (kps && kps.length >= 2) {
          const center = keypointCenter(kps[0], kps[1])
          const wx = (0.5 - center.x) * planeDimensions.width
          const wy = (0.5 - center.y) * planeDimensions.height
          this.posHistory = Array(SMOOTH_FRAMES).fill({ x: wx, y: wy })
          this.smoothX = wx
          this.smoothY = wy
        }
      }
      // Teletransportar a posición correcta con parallax ya aplicado
      for (const eye of this.eyes) {
        const baseX = eye.meta.nx * planeDimensions.width
        const baseY = eye.meta.ny * planeDimensions.height
        eye.group.position.set(
          baseX - this.smoothX * eye.parallaxStrength,
          baseY - this.smoothY * eye.parallaxStrength,
          eye.baseZ
        )
        eye.group.visible = true
      }
    } else {
      this.posHistory = []
      this.smoothX = 0
      this.smoothY = 0
      for (const eye of this.eyes) eye.group.visible = false
    }
    console.log('👁️ ParallaxEffect.setActive():', active)
  }

  dispose() {
    glowTexture?.dispose()
    glowTexture = null
    this.group.clear()
    this.eyes = []
  }
}
