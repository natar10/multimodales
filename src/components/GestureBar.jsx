import React from 'react'

const EFFECTS = [
  { src: '/gestos/gestoPortal.jpg',      label: 'Portal' },
  { src: '/gestos/gestoTercerOjo.jpg',   label: 'Tercer Ojo' },
  { src: '/gestos/gestoPaz.jpg',         label: 'Voz' },
  { src: '/gestos/chisme.jpg',           label: 'Chisme' },
  { src: '/gestos/caliente.jpg',         label: 'Caliente' },
  { src: '/gestos/elegante.jpg',         label: 'Elegante' },
  { src: '/gestos/exFxrisaMalevola.png', label: 'Risa' },
  { src: '/gestos/exFxsmug.png',         label: 'Smug' },
  { src: '/gestos/preocupado.png',       label: 'Preocupado' },
]

export function GestureBar() {
  return (
    <div className="gesture-bar">
      {EFFECTS.map(({ src, label }) => (
        <div key={label} className="gesture-bubble" title={label}>
          <img src={src} alt={label} className="gesture-bubble-img" />
        </div>
      ))}
    </div>
  )
}
