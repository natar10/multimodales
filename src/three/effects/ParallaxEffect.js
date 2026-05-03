import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { keypointCenter, PLANE_WIDTH, PLANE_HEIGHT, PLANE_Z } from '../../utils/coordUtils.js'

const loader = new GLTFLoader()
const EYE_COUNT = 15
const SMOOTH_FRAMES = 4

export class ParallaxEffect {
  constructor() {
    this.group = new THREE.Group()
    this.eyes = []   // { mesh, orbitX, orbitY, baseZ, parallaxFactor }
    this.isActive = false
    this.posHistory = []
    this.smoothX = 0
    this.smoothY = 0
  }

  init(scene) {
    loader.load('/models/eye.glb', (gltf) => {
      const template = gltf.scene

      for (let i = 0; i < EYE_COUNT; i++) {
        const clone = template.clone(true)

        // Evenly space angles around face, with slight randomness
        const angle = (i / EYE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
        const radius = 2.2 + Math.random() * 3.2   // 2.2 – 5.4 world units from face

        // Fixed orbit offset from face center (keeps eyes around the face)
        const orbitX = Math.cos(angle) * radius
        const orbitY = Math.sin(angle) * radius * 0.65   // flatten slightly on Y

        // Depth: spread ± relative to video plane
        const depthT = i / (EYE_COUNT - 1)   // deterministic spread 0→1
        const baseZ = PLANE_Z + (-2.0 + depthT * 3.5)   // -12 to -8.5

        // Scale: closer eyes are larger
        const scale = 8 + depthT * 22   // 8 to 30

        // Parallax factor: farther eyes move less, closer eyes move more
        const parallaxFactor = 1.0 + (baseZ - PLANE_Z) / 2.5

        clone.scale.setScalar(scale)
        clone.position.set(orbitX, orbitY, baseZ)
        clone.visible = false

        this.eyes.push({ mesh: clone, orbitX, orbitY, baseZ, parallaxFactor })
        this.group.add(clone)
      }

      console.log('✅ ParallaxEffect: spawned', EYE_COUNT, 'eye clones')
    }, undefined, (err) => console.error('❌ ParallaxEffect load error:', err))

    scene.add(this.group)
  }

  update(delta, faceDetections) {
    if (!this.isActive) return

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
      eye.mesh.rotation.y += delta * 0.25
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
