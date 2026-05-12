import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { VideoPlane } from './VideoPlane.js'
import { SnapAuraEffect } from './effects/SnapAuraEffect.js'
import { PortalEffect } from './effects/PortalEffect.js'
import { MirrorEffect } from './effects/MirrorEffect.js'
import { SpiderSenseEffect } from './effects/SpiderSenseEffect.js'
import { ParallaxEffect } from './effects/ParallaxEffect.js'
import { ChismePotente } from './effects/ChismePotente.js'
import { planeDimensions } from '../utils/coordUtils.js'

export class SceneManager {
  constructor(containerElement, video) {
    console.log('🏭 SceneManager constructor called')
    this.container = containerElement
    this.video = video
    this.renderer = null
    this.composer = null
    this.scene = null
    this.camera = null
    this.videoPlane = null
    this.effects = {}
    this.isRunning = false
    this.startTime = Date.now()
    this.faceDetectionsRef = null  // Set externally from useFaceTracking
    this.handDetectionsRef = null  // Set externally from useThreeScene
  }

  setFaceDetectionsRef(ref) {
    this.faceDetectionsRef = ref
  }

  setHandDetectionsRef(ref) {
    this.handDetectionsRef = ref
  }

  init() {
    // Dimensiones fijas desde .env (con fallback a ventana completa)
    const canvasW = parseInt(import.meta.env.VITE_CANVAS_WIDTH)  || window.innerWidth
    const canvasH = parseInt(import.meta.env.VITE_CANVAS_HEIGHT) || window.innerHeight

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(canvasW, canvasH)
    this.renderer.setClearColor(0x000000)
    this.renderer.toneMapping = THREE.NoToneMapping
    this.renderer.toneMappingExposure = 1.0

    // Centrar el canvas en el contenedor via CSS
    const canvas = this.renderer.domElement
    canvas.style.display = 'block'
    canvas.style.margin = 'auto'
    this.container.appendChild(canvas)

    // Scene
    this.scene = new THREE.Scene()

    // Camera — aspect ratio del canvas configurado
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvasW / canvasH,
      0.1,
      1000
    )
    this.camera.position.z = 5

    // Post-processing
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))

    // Video Plane
    this.videoPlane = new VideoPlane(this.video)
    this.videoPlane.init(this.scene)
    this.videoPlane.fitToCamera(this.camera)
    this.syncPlaneDimensions()
    console.log('🎬 VideoPlane initialized, scene children:', this.scene.children.length)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    // Initialize effects
    this.registerEffect('snap', new SnapAuraEffect())
    // this.registerEffect('portal', new PortalEffect())
    // this.registerEffect('mirror', new MirrorEffect())
    this.registerEffect('spiderSense', new SpiderSenseEffect())
    this.registerEffect('parallax', new ParallaxEffect())
    this.registerEffect('chismePotente', new ChismePotente())

    // Resize solo actualiza el centrado, no el tamaño del canvas
    window.addEventListener('resize', () => this.onWindowResize())
  }

  registerEffect(name, effectInstance) {
    this.effects[name] = effectInstance
    const n = effectInstance.init.length
    if (n >= 3) {
      effectInstance.init(this.scene, this.renderer, this.camera)
    } else if (n === 2) {
      effectInstance.init(this.scene, this.composer)
    } else {
      effectInstance.init(this.scene)
    }
  }

  getEffect(name) {
    return this.effects[name]
  }

  setSnapActive(active) {
    const effect = this.effects['snap']
    if (effect) effect.setActive(active)
    const parallax = this.effects['parallax']
    const faceLandmarks = this.faceDetectionsRef?.current ?? null
    if (parallax) parallax.setActive(active, faceLandmarks)
  }

  setPortalActive(active) {
    const effect = this.effects['portal']
    if (effect) effect.setActive(active)
  }

  setClapActive(active) {
    const effect = this.effects['clap']
    if (effect) effect.setActive(active)
  }

  setMirrorActive(active) {
    const effect = this.effects['mirror']
    if (effect) effect.setActive(active)
  }

  setSpiderSenseActive(active) {
    const effect = this.effects['spiderSense']
    if (effect) effect.setActive(active)
  }

  setChismeActive(active) {
    console.log(`[CHISME] T3 SceneManager.setChismeActive(${active})  +${(performance.now() - (window.__chismeT0 ?? 0)).toFixed(1)}ms desde T0`)
    const effect = this.effects['chismePotente']
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

    // Read face landmarks from ref (updated by useFaceTracking)
    const faceLandmarks = this.faceDetectionsRef?.current ?? null
    
    // Read hand detections from ref (updated by useHandTracking)
    const handDetections = this.handDetectionsRef?.current ?? null

    // Update all effects
    Object.values(this.effects).forEach((effect) => {
      if (effect.update) {
        effect.update(deltaTime, faceLandmarks, handDetections)
      }
    })

    this.composer.render()

    if (this.isRunning) {
      requestAnimationFrame(this.animate)
    }
  }

  onWindowResize() {
    // El canvas tiene tamaño fijo (definido en .env), no se redimensiona.
    // Solo sincronizamos por si acaso el contenedor cambió de posición.
  }

  /** Sincroniza planeDimensions de coordUtils con el tamaño real del VideoPlane */
  syncPlaneDimensions() {
    if (this.videoPlane) {
      planeDimensions.width = this.videoPlane.planeWidth
      planeDimensions.height = this.videoPlane.planeHeight
      planeDimensions.z = -10
    }
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
    this.composer?.dispose()
    this.renderer?.dispose()
    this.container?.removeChild(this.renderer.domElement)
  }
}
