import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { keypointCenter, PLANE_WIDTH, PLANE_HEIGHT, PLANE_Z } from '../../utils/coordUtils.js'

const loader = new GLTFLoader()
const EYE_COUNT = 15
const SMOOTH_FRAMES = 4

const EMISSIVE_COLOR = new THREE.Color(0x00ff88)

export class ParallaxEffect {
  constructor() {
    this.group = new THREE.Group()
    this.eyes = []   // { mesh, orbitX, orbitY, baseZ, parallaxFactor, meshData[] }
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

        // Evenly space angles around face, with slight randomness
        const angle = (i / EYE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.9
        const radius = 2.8 + Math.random() * 7.2   // 2.2 – 5.4 world units from face

        // Fixed orbit offset from face center (keeps eyes around the face)
        const orbitX = Math.cos(angle) * radius
        const orbitY = Math.sin(angle) * radius * 0.75   // flatten slightly on Y

        // Depth: spread ± relative to video plane
        const depthT = i / (EYE_COUNT - 1)   // deterministic spread 0→1
        const baseZ = PLANE_Z + (-2.0 + depthT * 3.5)   // -12 to -8.5

        // Scale: closer eyes are larger
        const scale = 15 + depthT * 42   // 8 to 30

        // Parallax factor: farther eyes move less, closer eyes move more
        const parallaxFactor = 1.0 + (baseZ - PLANE_Z) / 2.5

        // Clone materials and set emissive green per mesh
        const meshData = []
        clone.traverse((child) => {
          if (child.isMesh) {
            const mat = child.material.clone()
            if (mat.emissive !== undefined) {
              mat.emissive = EMISSIVE_COLOR
              mat.emissiveIntensity = 0.2
            }
            child.material = mat
            meshData.push({
              material: mat,
              phase: Math.random() * Math.PI * 2,
              freq: 0.4 + Math.random() * 1.2,
            })
          }
        })

        clone.scale.setScalar(scale)
        clone.position.set(orbitX, orbitY, baseZ)
        clone.visible = false

        this.eyes.push({ mesh: clone, orbitX, orbitY, baseZ, parallaxFactor, meshData })
        this.group.add(clone)
      }

      console.log('✅ ParallaxEffect: spawned', EYE_COUNT, 'eye clones')
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
        const wx = (0.5 - center.x) * PLANE_WIDTH
        const wy = (0.5 - center.y) * PLANE_HEIGHT

        this.posHistory.push({ x: wx, y: wy })
        if (this.posHistory.length > SMOOTH_FRAMES) this.posHistory.shift()

        const sum = this.posHistory.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 })
        this.smoothX = sum.x / this.posHistory.length
        this.smoothY = sum.y / this.posHistory.length
      }
    }

    for (const eye of this.eyes) {
      // Eye tracks face position scaled by its depth-based parallax factor,
      // plus its fixed orbit offset so it stays around (not in front of) the face
      const targetX = this.smoothX * eye.parallaxFactor + eye.orbitX
      const targetY = this.smoothY * eye.parallaxFactor + eye.orbitY

      eye.mesh.position.x += (targetX - eye.mesh.position.x) * 0.08
      eye.mesh.position.y += (targetY - eye.mesh.position.y) * 0.08
      eye.mesh.position.z = eye.baseZ

      // Slow spin for visual interest
      eye.mesh.rotation.y += delta * 0.85

      // Animate emissive intensity independently per eye
      for (const m of eye.meshData) {
        if (m.material.emissive !== undefined) {
          m.material.emissiveIntensity = 0.1 + 0.5 * (0.5 + 0.5 * Math.sin(this.time * m.freq + m.phase))
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
    }
    console.log('👁️ ParallaxEffect.setActive():', active)
  }

  dispose() {
    this.group.clear()
    this.eyes = []
  }
}
