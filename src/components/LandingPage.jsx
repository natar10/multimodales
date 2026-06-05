import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function LandingPage({ onStart }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 4.5

    // --- Particle nebula ---
    const COUNT = 5000
    const positions = new Float32Array(COUNT * 3)
    const colors    = new Float32Array(COUNT * 3)

    const palette = [
      new THREE.Color('#eea944'), // gold       — majority
      new THREE.Color('#eea944'),
      new THREE.Color('#c4a05a'), // gold dim
      new THREE.Color('#6b3fa0'), // purple
      new THREE.Color('#1782a4'), // teal
      new THREE.Color('#f0e6c8'), // cream
      new THREE.Color('#d6222b'), // crimson    — accent
    ]

    for (let i = 0; i < COUNT; i++) {
      // 65% disc (galactic plane) + 35% sphere halo
      let x, y, z
      if (Math.random() < 0.65) {
        const r     = Math.pow(Math.random(), 0.5) * 6 + 0.3
        const theta = Math.random() * Math.PI * 2
        x = Math.cos(theta) * r
        y = (Math.random() - 0.5) * 1.2
        z = Math.sin(theta) * r
      } else {
        const phi   = Math.acos(2 * Math.random() - 1)
        const theta = Math.random() * Math.PI * 2
        const r     = 2.5 + Math.random() * 3
        x = r * Math.sin(phi) * Math.cos(theta)
        y = r * Math.cos(phi) * 0.6
        z = r * Math.sin(phi) * Math.sin(theta)
      }
      positions[i * 3]     = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size:         0.045,
      vertexColors: true,
      transparent:  true,
      opacity:      0.85,
      sizeAttenuation: true,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Slow auto-rotation
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      particles.rotation.y += 0.0006
      particles.rotation.x += 0.00015
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div className="landing-page">
      <canvas ref={canvasRef} className="landing-canvas" />
      <div className="landing-content">
        <p className="landing-eyebrow">Nataly Rocha</p>
        <h1 className="landing-title">MOVESTREAM</h1>
        <p className="landing-tagline">Controla tu stream sin tocar nada.</p>
        <button className="landing-btn" onClick={onStart}>
          Empezar Stream
        </button>
      </div>
    </div>
  )
}
