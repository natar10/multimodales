import * as THREE from 'three'
import { normalizedToWorld } from '../../utils/coordUtils.js'

// Ángulos de reloj en world space (0=derecha, π/2=arriba, π=izquierda)
// Posiciones: 9h, 10h, 11h, 12h, 1h, 2h, 3h
const CLOCK_ANGLES = [
  Math.PI,              // 9 en punto  (izquierda)
  (5 / 6) * Math.PI,   // 10 en punto
  (2 / 3) * Math.PI,   // 11 en punto
  Math.PI / 2,         // 12 en punto (arriba)
  Math.PI / 3,         // 1 en punto
  Math.PI / 6,         // 2 en punto
  0,                   // 3 en punto  (derecha)
]

// Landmarks de referencia para calcular la elipse de la cara
const LM_TOP   = 10   // cima de la cabeza
const LM_CHIN  = 152  // barbilla
const LM_LEFT  = 234  // sien izquierda (del usuario → aparece a la derecha del viewer)
const LM_RIGHT = 454  // sien derecha   (del usuario → aparece a la izquierda del viewer)
// Centro: nariz
const LM_NOSE  = [1, 4, 5, 6, 168]

const FADE_OUT_DURATION = 0.9  // segundos de fade-out al desactivar

export class SpiderSenseEffect {
  constructor() {
    this.group = new THREE.Group()
    this.bolts = []
    this.isActive = false
    this.time = 0
    this.numSegments = 5

    this._audio = new Audio('/spiderman-tutururu.mp3')
    this._audio.loop = true
    this._fadeOut = false
    this._fadeTimer = 0
  }

  init(scene) {
    CLOCK_ANGLES.forEach((angle, i) => {
      const outer = this._createBoltMesh(0xffff00)
      const inner = this._createBoltMesh(0xffffff)

      const boltGroup = new THREE.Group()
      boltGroup.add(outer)
      boltGroup.add(inner)

      this.bolts.push({
        group: boltGroup,
        outerMesh: outer,
        innerMesh: inner,
        clockAngle: angle,
        randomOffset: Math.random() * Math.PI * 2,
        zigzagDir: i % 2 === 0 ? 1 : -1,
      })
      this.group.add(boltGroup)
    })

    this.group.visible = false
    scene.add(this.group)
  }

  _createBoltMesh(color) {
    const n = this.numSegments
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array((n + 1) * 2 * 3)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const indices = []
    for (let i = 0; i < n; i++) {
      const b = i * 2
      indices.push(b, b + 1, b + 2, b + 1, b + 3, b + 2)
    }
    geometry.setIndex(indices)

    return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthTest: false,
    }))
  }

  _updateBoltGeometry(mesh, angle, length, halfWidth, amplitude, zigzagDir) {
    const n = this.numSegments
    const attr = mesh.geometry.attributes.position
    const pos = attr.array

    const dirX = Math.cos(angle)
    const dirY = Math.sin(angle)
    const perpX = -Math.sin(angle)
    const perpY = Math.cos(angle)

    for (let i = 0; i <= n; i++) {
      const t = i / n
      const zig = (i === 0 || i === n) ? 0 : (i % 2 === 0 ? amplitude : -amplitude) * zigzagDir

      const sx = dirX * (t * length) + perpX * zig
      const sy = dirY * (t * length) + perpY * zig

      pos[(i * 2) * 3]     = sx - perpX * halfWidth
      pos[(i * 2) * 3 + 1] = sy - perpY * halfWidth
      pos[(i * 2) * 3 + 2] = 0

      pos[(i * 2 + 1) * 3]     = sx + perpX * halfWidth
      pos[(i * 2 + 1) * 3 + 1] = sy + perpY * halfWidth
      pos[(i * 2 + 1) * 3 + 2] = 0
    }
    attr.needsUpdate = true
  }

  update(delta, faceLandmarks) {
    // Fade-out del audio cuando se desactiva
    if (this._fadeOut) {
      this._fadeTimer += delta
      this._audio.volume = Math.max(0, 1 - this._fadeTimer / FADE_OUT_DURATION)
      if (this._fadeTimer >= FADE_OUT_DURATION) {
        this._audio.pause()
        this._audio.currentTime = 0
        this._fadeOut = false
      }
    }

    if (!this.isActive || !faceLandmarks) return
    this.time += delta

    // --- Centro de la cara (nariz) ---
    let cx = 0, cy = 0, cnt = 0
    LM_NOSE.forEach(idx => {
      const lm = faceLandmarks[idx]
      if (lm) { cx += lm.x; cy += lm.y; cnt++ }
    })
    if (cnt > 0) { cx /= cnt; cy /= cnt } else { cx = 0.5; cy = 0.5 }
    const wCenter = normalizedToWorld(cx, cy, 0.5)

    // --- Radio horizontal y vertical de la elipse de la cara ---
    // Multiplicamos por 1.2 para que los rayos salgan FUERA de la cabeza
    let rx = 3.0, ry = 3.5  // fallback en world units

    const lmL = faceLandmarks[LM_LEFT]
    const lmR = faceLandmarks[LM_RIGHT]
    if (lmL && lmR) {
      const wL = normalizedToWorld(lmL.x, lmL.y, 0.5)
      const wR = normalizedToWorld(lmR.x, lmR.y, 0.5)
      rx = Math.abs(wL.x - wR.x) / 2 * 1.2
    }

    const lmT = faceLandmarks[LM_TOP]
    const lmC = faceLandmarks[LM_CHIN]
    if (lmT && lmC) {
      const wT = normalizedToWorld(lmT.x, lmT.y, 0.5)
      const wCh = normalizedToWorld(lmC.x, lmC.y, 0.5)
      ry = Math.abs(wT.y - wCh.y) / 2 * 1.1
    }

    this.bolts.forEach((bolt) => {
      const angle = bolt.clockAngle

      // Punto de inicio del rayo: sobre la elipse de la cara en este ángulo
      const ex = wCenter.x + rx * Math.cos(angle)
      const ey = wCenter.y + ry * Math.sin(angle)
      bolt.group.position.set(ex, ey, wCenter.z)

      // Vibración eléctrica
      const shake = Math.sin(this.time * 38 + bolt.randomOffset) * 0.06
      const finalAngle = angle + shake

      const length = 2.0 + Math.sin(this.time * 12 + bolt.randomOffset) * 0.3
      const amplitude = 0.38

      // Rayo exterior amarillo grueso
      this._updateBoltGeometry(bolt.outerMesh, finalAngle, length, 0.20, amplitude, bolt.zigzagDir)
      // Destello interior blanco fino (efecto cómic)
      this._updateBoltGeometry(bolt.innerMesh, finalAngle, length * 0.85, 0.07, amplitude, bolt.zigzagDir)

      const flicker = 0.78 + Math.random() * 0.22
      bolt.outerMesh.material.opacity = flicker
      bolt.outerMesh.material.color.setHex(Math.random() > 0.85 ? 0xffd700 : 0xffff00)
      bolt.innerMesh.material.opacity = flicker * 0.65
    })
  }

  setActive(active) {
    this.isActive = active
    this.group.visible = active

    if (active) {
      this._fadeOut = false
      this._fadeTimer = 0
      this._audio.volume = 1
      this._audio.currentTime = 0
      this._audio.play().catch(() => {})
    } else {
      this._fadeOut = true
      this._fadeTimer = 0
    }
  }

  dispose() {
    this._audio.pause()
    this._audio.src = ''
    this.bolts.forEach(b => {
      b.outerMesh.geometry.dispose()
      b.outerMesh.material.dispose()
      b.innerMesh.geometry.dispose()
      b.innerMesh.material.dispose()
    })
    this.group.clear()
    this.bolts = []
  }
}
