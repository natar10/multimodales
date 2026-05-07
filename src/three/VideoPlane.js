import * as THREE from 'three'

export class VideoPlane {
  constructor(video) {
    this.video = video
    this.mesh = null
    // Dimensiones reales del plano en world units (actualizadas por fitToCamera)
    this.planeWidth = 16
    this.planeHeight = 9
  }

  /**
   * Calcula el tamaño del plano respetando el aspect ratio del vídeo.
   * Usa letterbox/pillarbox para que el vídeo no se estire.
   * @param {THREE.PerspectiveCamera} camera
   */
  fitToCamera(camera) {
    if (!this.mesh) return

    const planeZ = this.mesh.position.z
    const distance = camera.position.z - planeZ
    const vFov = (camera.fov * Math.PI) / 180

    // Tamaño máximo que cabe en el frustum
    const frustumHeight = 2 * Math.tan(vFov / 2) * distance
    const frustumWidth = frustumHeight * camera.aspect

    // Aspect ratio real del vídeo (fallback 16/9 si aún no hay metadatos)
    const videoAspect = this.video.videoWidth && this.video.videoHeight
      ? this.video.videoWidth / this.video.videoHeight
      : 16 / 9

    // Ajuste cover: llenar el frustum manteniendo el aspect del vídeo
    let w, h
    if (frustumWidth / frustumHeight > videoAspect) {
      // Viewport más ancho que el vídeo → ajustar por anchura
      w = frustumWidth
      h = frustumWidth / videoAspect
    } else {
      // Viewport más alto que el vídeo → ajustar por altura
      h = frustumHeight
      w = frustumHeight * videoAspect
    }

    this.mesh.scale.set(w, h, 1)
    this.planeWidth = w
    this.planeHeight = h
  }

  init(scene) {
    const texture = new THREE.VideoTexture(this.video)
    texture.colorSpace = THREE.SRGBColorSpace

    // Geometría unitaria — el tamaño real lo controla fitToCamera()
    const geometry = new THREE.PlaneGeometry(1, 1)
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
