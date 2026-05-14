import * as THREE from 'three'
import { normalizedToWorld } from '../../utils/coordUtils.js'

export class SpiderSenseEffect {
  constructor() {
    this.group = new THREE.Group()
    this.lines = []
    this.isActive = false
    this.time = 0
  }

  init(scene) {
    // Crear 5 líneas zig-zag
    const lineCount = 6
    for (let i = 0; i < lineCount; i++) {
      const geometry = new THREE.BufferGeometry()
      const points = []
      
      // Cada línea tiene 4-5 puntos en zig-zag
      const segmentCount = 4
      for (let j = 0; j < segmentCount; j++) {
        points.push(new THREE.Vector3(0, 0, 0))
      }
      geometry.setFromPoints(points)

      const material = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0xff0000 : 0xffff00, // Rojo y amarillo alternados
        linewidth: 3,
        transparent: true,
        opacity: 0.8
      })

      const line = new THREE.Line(geometry, material)
      this.lines.push({
        mesh: line,
        angle: (i / lineCount) * Math.PI - Math.PI / 2, // Distribuidas en arco sobre la cabeza
        offset: Math.random() * 10
      })
      this.group.add(line)
    }

    this.group.visible = false
    scene.add(this.group)
    console.log('✅ SpiderSenseEffect initialized')
  }

  update(delta, faceLandmarks) {
    if (!this.isActive) return
    
    if (!faceLandmarks) {
      // console.warn('SpiderSenseEffect: No face landmarks received')
      return
    }

    this.time += delta

    // Landmark 10 es el centro superior de la frente
    const forehead = faceLandmarks[10]
    if (!forehead) return

    const worldPos = normalizedToWorld(forehead.x, forehead.y, 0.5)
    this.group.position.set(worldPos.x, worldPos.y, worldPos.z)

    // Vibración y animación de las líneas
    this.lines.forEach((lineObj, i) => {
      const { mesh, angle, offset } = lineObj
      const positions = mesh.geometry.attributes.position.array
      
      // Animación de vibración rápida
      const shake = Math.sin(this.time * 40 + offset) * 0.1
      const length = 1.2 + Math.sin(this.time * 20 + offset) * 0.2

      for (let j = 0; j < 4; j++) {
        const t = j / 3
        const curve = Math.sin(t * Math.PI + this.time * 30) * 0.15
        
        // Calcular posición del punto del zig-zag
        const r = t * length
        const x = Math.sin(angle + shake) * r + curve
        const y = Math.cos(angle + shake) * r
        const z = Math.sin(this.time * 25 + j) * 0.05

        positions[j * 3] = x
        positions[j * 3 + 1] = y
        positions[j * 3 + 2] = z
      }
      mesh.geometry.attributes.position.needsUpdate = true
      
      // Parpadeo de opacidad
      mesh.material.opacity = 0.6 + Math.sin(this.time * 50 + i) * 0.4
    })
  }

  setActive(active) {
    this.isActive = active
    this.group.visible = active
    console.log('🕷️ SpiderSenseEffect.setActive():', active)
  }

  dispose() {
    this.lines.forEach(l => {
      l.mesh.geometry.dispose()
      l.mesh.material.dispose()
    })
    this.group.clear()
    this.lines = []
  }
}

