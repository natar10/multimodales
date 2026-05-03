import * as THREE from 'three'
import { VideoPlane } from './VideoPlane.js'
import { SnapAuraEffect } from './effects/SnapAuraEffect.js'
import { PortalEffect } from './effects/PortalEffect.js'
import { BubblesEffect } from './effects/BubblesEffect.js'
import { MirrorEffect } from './effects/MirrorEffect.js'
import { SpiderSenseEffect } from './effects/SpiderSenseEffect.js'
import { ParallaxEffect } from './effects/ParallaxEffect.js'

export class SceneManager {
  constructor(containerElement, video) {
    console.log('🏭 SceneManager constructor called')
    this.container = containerElement
    this.video = video
    this.renderer = null
    this.scene = null
    this.camera = null
    this.videoPlane = null
    this.effects = {}
    this.isRunning = false
    this.startTime = Date.now()
    this.faceDetectionsRef = null  // Set externally from useFaceTracking
  }

  setFaceDetectionsRef(ref) {
    this.faceDetectionsRef = ref
  }

  init() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x000000)
    this.container.appendChild(this.renderer.domElement)

    // Scene
    this.scene = new THREE.Scene()

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.z = 5

    // Video Plane
    this.videoPlane = new VideoPlane(this.video)
    this.videoPlane.init(this.scene)
    console.log('🎬 VideoPlane initialized, scene children:', this.scene.children.length)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // Initialize effects
    this.registerEffect('snap', new SnapAuraEffect())
    this.registerEffect('portal', new PortalEffect())
    this.registerEffect('clap', new BubblesEffect())
    this.registerEffect('mirror', new MirrorEffect())
    this.registerEffect('spiderSense', new SpiderSenseEffect())
    this.registerEffect('parallax', new ParallaxEffect())

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize())
  }

  registerEffect(name, effectInstance) {
    this.effects[name] = effectInstance
    effectInstance.init(this.scene)
  }

  getEffect(name) {
    return this.effects[name]
  }

  setSnapActive(active) {
    const effect = this.effects['snap']
    if (effect) effect.setActive(active)
    const parallax = this.effects['parallax']
    if (parallax) parallax.setActive(active)
  }

  setClapActive(active) {
    const effect = this.effects['clap']
    if (effect) effect.setActive(active)
  }

  setMirrorActive(active) {
    const effect = this.effects['mirror']
    if (effect) effect.setActive(active)
  }

  setBackground(textureUrl) {
    if (textureUrl) {
      new THREE.TextureLoader().load(textureUrl, (texture) => {
        this.scene.background = texture
      })
    }
  }

  clearBackground() {
    this.scene.background = null
  }

  start() {
    this.isRunning = true
    this.animate()
  }

  animate = () => {
    const now = Date.now()
    const deltaTime = (now - this.startTime) / 1000
    this.startTime = now

    // Update video plane
    if (this.videoPlane) {
      this.videoPlane.update()
    }

    // Read face detections from ref (updated by useFaceTracking)
    const faceDetections = this.faceDetectionsRef?.current ?? null

    // Update all effects
    Object.values(this.effects).forEach((effect) => {
      if (effect.update) {
        effect.update(deltaTime, faceDetections)
      }
    })

    this.renderer.render(this.scene, this.camera)

    if (this.isRunning) {
      requestAnimationFrame(this.animate)
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  dispose() {
    this.isRunning = false

    // Dispose all effects
    Object.values(this.effects).forEach((effect) => {
      if (effect.dispose) {
        effect.dispose()
      }
    })

    this.videoPlane?.dispose()
    this.renderer?.dispose()
    this.container?.removeChild(this.renderer.domElement)
  }
}
