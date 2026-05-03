import * as THREE from 'three'

export class VideoPlane {
  constructor(video) {
    this.video = video
    this.mesh = null
  }

  init(scene) {
    const texture = new THREE.VideoTexture(this.video)
    texture.colorSpace = THREE.SRGBColorSpace

    const geometry = new THREE.PlaneGeometry(16, 9)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.y = Math.PI
    this.mesh.position.z = -10

    scene.add(this.mesh)
    console.log('✅ VideoPlane added to scene')
  }

  update() {
    if (this.mesh && this.mesh.material.map) {
      this.mesh.material.map.needsUpdate = true
    }
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose()
      this.mesh.material.map.dispose()
      this.mesh.material.dispose()
    }
  }
}
