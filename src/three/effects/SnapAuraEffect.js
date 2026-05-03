import * as THREE from 'three'
import { normalizedToWorld, keypointCenter, PLANE_HEIGHT } from '../../utils/coordUtils.js'

export class SnapAuraEffect {
  constructor() {
    this.group = new THREE.Group()
    this.auraMesh = null
    this.eyeMesh = null
    this.isActive = false
    this.time = 0
  }

  init(scene) {
    // Aura: esfera de puntos pulsante
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
      color: 0x00ff88,
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

    // Tercer ojo
    const eyeGeo = new THREE.IcosahedronGeometry(0.2, 3)
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    this.eyeMesh = new THREE.Mesh(eyeGeo, eyeMat)
    this.group.add(this.eyeMesh)

    scene.add(this.group)
    console.log('✅ SnapAuraEffect initialized')
  }

  /**
   * @param {number} delta
   * @param {Array} faceDetections - array from FaceDetector (result.detections)
   */
  update(delta, faceDetections) {
    if (!this.auraMesh || !this.eyeMesh) return

    this.time += delta

    if (this.isActive) {
      // Aura pulsa
      this.auraMesh.material.opacity = (0.3 + 0.7 * Math.sin(this.time * 3)) * 0.8

      // Posicionar ojo entre los dos ojos del rostro detectado
      if (faceDetections && faceDetections.length > 0) {
        const detection = faceDetections[0]
        const kps = detection.keypoints
        // keypoint 0 = left eye, 1 = right eye (in normalized video space)
        if (kps && kps.length >= 2) {
          const center = keypointCenter(kps[0], kps[1])
          const world = normalizedToWorld(center.x, center.y, 0.5)
          // Move up to forehead level: use eye-to-nose distance as reference
          const eyeToNoseY = kps.length >= 3 ? Math.abs(kps[2].y - center.y) : 0.04
          const foreheadOffset = eyeToNoseY * PLANE_HEIGHT * 1.5
          this.eyeMesh.position.set(world.x, world.y + foreheadOffset, world.z)
        }
      }

      // Ojo visible y pulsante
      this.eyeMesh.material.opacity = 0.7 + 0.3 * Math.sin(this.time * 4)
      const s = 0.9 + 0.1 * Math.sin(this.time * 2)
      this.eyeMesh.scale.set(s, s, s)
    } else {
      // Fade out
      this.auraMesh.material.opacity = Math.max(0, this.auraMesh.material.opacity - delta * 3)
      this.eyeMesh.material.opacity = Math.max(0, this.eyeMesh.material.opacity - delta * 3)
    }

    this.eyeMesh.rotation.y += 0.02
  }

  setActive(active) {
    this.isActive = active
    console.log('✨ SnapAuraEffect.setActive():', active)
    if (active) {
      this.time = 0
    }
  }

  dispose() {
    this.auraMesh?.geometry.dispose()
    this.auraMesh?.material.dispose()
    this.eyeMesh?.geometry.dispose()
    this.eyeMesh?.material.dispose()
    this.group.clear()
  }
}
