import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { normalizedToWorld, keypointCenter, PLANE_HEIGHT } from '../../utils/coordUtils.js'

const loader = new GLTFLoader()

export class SnapAuraEffect {
  constructor() {
    this.group = new THREE.Group()      // Root group — follows face position
    this.chakraGroup = new THREE.Group() // Chakra + eye together
    this.auraMesh = null
    this.chakraMesh = null
    this.eyeMesh = null
    this.isActive = false
    this.time = 0
  }

  init(scene) {
    // --- Aura: particle cloud behind everything ---
    const auraPts = []
    const auraCount = 500
    const radius = 3
    for (let i = 0; i < auraCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      auraPts.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      )
    }
    const auraGeo = new THREE.BufferGeometry()
    auraGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(auraPts), 3))
    const auraMat = new THREE.PointsMaterial({
      color: 0xe5e556,
      size: 0.08,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    this.auraMesh = new THREE.Points(auraGeo, auraMat)
    this.auraMesh.position.z = -10
    this.group.add(this.auraMesh)

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
      chakra.scale.setScalar(0.25)
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
          // Keep original material — it's a realistic eye texture
        }
      })
      eye.scale.setScalar(35)
      this.eyeMesh = eye
      this.chakraGroup.add(eye)
      console.log('✅ Eye GLB loaded')
    }, undefined, (err) => console.error('❌ Eye load error:', err))

    // Dedicated light for the eye — follows chakraGroup
    const eyeLight = new THREE.PointLight(0xffffff, 3, 5)
    eyeLight.position.set(0, 0, 1.5) // In front of the eye
    this.chakraGroup.add(eyeLight)

    this.group.add(this.chakraGroup)
    this.group.visible = false
    scene.add(this.group)
    console.log('✅ SnapAuraEffect initialized')
  }

  update(delta, faceDetections) {
    if (!this.auraMesh) return

    this.time += delta

    if (this.isActive) {
      // Update forehead position from face detection
      if (faceDetections && faceDetections.length > 0) {
        const detection = faceDetections[0]
        const kps = detection.keypoints
        if (kps && kps.length >= 2) {
          const center = keypointCenter(kps[0], kps[1])
          const eyeToNoseY = kps.length >= 3 ? Math.abs(kps[2].y - center.y) : 0.04
          const foreheadOffset = eyeToNoseY * PLANE_HEIGHT * 1.5
          const world = normalizedToWorld(center.x, center.y, 0.5)

          // Smooth position update
          this.chakraGroup.position.x += (world.x - this.chakraGroup.position.x) * 0.15
          this.chakraGroup.position.y += ((world.y + foreheadOffset) - this.chakraGroup.position.y) * 0.15
          this.chakraGroup.position.z = world.z
        }
      }

      // Spin chakra on Z axis (clockwise when facing camera)
      if (this.chakraMesh) {
        this.chakraMesh.rotation.x -= delta * 0.8
        this.chakraMesh.rotation.y -= delta * 0.8
      }

      // Slow eye rotation
      // if (this.eyeMesh) {
      //   this.eyeMesh.rotation.y += delta * 0.3
      // }

      // Aura pulse
      this.auraMesh.material.opacity = (0.3 + 0.7 * Math.sin(this.time * 3)) * 0.8

      // Chakra opacity pulse
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
      // Fade out aura
      this.auraMesh.material.opacity = Math.max(0, this.auraMesh.material.opacity - delta * 3)

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
      this.group.visible = true
    } else {
      // Hide after fade out completes
      setTimeout(() => {
        if (!this.isActive) this.group.visible = false
      }, 1000)
    }
  }

  dispose() {
    this.auraMesh?.geometry.dispose()
    this.auraMesh?.material.dispose()
    this.group.clear()
  }
}
