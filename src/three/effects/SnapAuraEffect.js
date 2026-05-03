import * as THREE from 'three'

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
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      auraPts.push(x, y, z)
    }

    const auraGeo = new THREE.BufferGeometry()
    auraGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(auraPts), 3))
    const auraMat = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.08,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
    })
    auraMat.blending = THREE.AdditiveBlending
    this.auraMesh = new THREE.Points(auraGeo, auraMat)
    this.auraMesh.position.z = -10
    this.group.add(this.auraMesh)

    // Tercer ojo: esfera emissiva verde
    const eyeGeo = new THREE.IcosahedronGeometry(0.3, 4)
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.8,
    })
    this.eyeMesh = new THREE.Mesh(eyeGeo, eyeMat)
    this.eyeMesh.position.set(0, 1, -9.5)
    this.eyeMesh.scale.set(0, 0, 0)
    this.group.add(this.eyeMesh)

    scene.add(this.group)
    console.log('✅ SnapAuraEffect initialized')
  }

  update(delta) {
    if (!this.auraMesh || !this.eyeMesh) return

    this.time += delta

    if (this.isActive) {
      const pulseFactor = 0.3 + 0.7 * Math.sin(this.time * 3)
      this.auraMesh.material.opacity = pulseFactor * 0.8

      const eyeScale = 0.8 + 0.2 * Math.sin(this.time * 2)
      this.eyeMesh.scale.set(eyeScale, eyeScale, eyeScale)

      this.eyeMesh.rotation.x += 0.01
      this.eyeMesh.rotation.y += 0.015
    } else {
      this.auraMesh.material.opacity = Math.max(0, this.auraMesh.material.opacity - delta * 3)
      const currentScale = this.eyeMesh.scale.x
      if (currentScale > 0) {
        const newScale = Math.max(0, currentScale - delta * 3)
        this.eyeMesh.scale.set(newScale, newScale, newScale)
      }
    }
  }

  setActive(active) {
    this.isActive = active
    console.log('✨ SnapAuraEffect.setActive():', active)
    if (active) {
      this.time = 0
    }
  }

  dispose() {
    if (this.auraMesh) {
      this.auraMesh.geometry.dispose()
      this.auraMesh.material.dispose()
    }
    if (this.eyeMesh) {
      this.eyeMesh.geometry.dispose()
      this.eyeMesh.material.dispose()
    }
    this.group.clear()
  }
}
