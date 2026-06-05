# MoveStream

## Qué es este proyecto

Prototipo académico para la asignatura "Técnicas Avanzadas de Interacción Multimodal" (UVa, curso 2025/2026). Es un asistente de efectos visuales para streamers que se controla con gestos, expresiones faciales y voz — sin tocar ningún dispositivo.

**Entrega final:** 11 de junio de 2026.

## Stack tecnológico

- **React 18** + **Vite** — scaffolding y UI
- **Three.js 0.184** — renderizado 3D y efectos visuales sobre canvas
- **@mediapipe/tasks-vision** — hand tracking y face tracking en el navegador
- **Web Speech API** — reconocimiento de voz nativo del navegador
- Sin backend. Todo corre en el navegador. OBS captura el canvas como Virtual Camera.

## Flujo de la aplicación

1. **Landing page** — nebulosa de partículas Three.js (5000 pts, colores del tema) + título MOVESTREAM + botón "Empezar Stream"
2. **Pantalla principal** — canvas Three.js con webcam + panel de modalidades + overlays React

## Interacciones implementadas (temática Dr. Strange)

### Gestos de mano (MediaPipe HandLandmarker, 2 manos)

| Gesto | Detección | Efecto |
|-------|-----------|--------|
| Puño izquierda + dedos extendidos mano derecha | `verticalHandDetector` — requiere exactamente 2 manos con handedness | `PortalEffect`: swirl shader + poster de película |
| Triángulo (índice+pulgar proximidad) | `triangleDetector` | `SnapAuraEffect`: aura verde + ojo 3D + `ParallaxEffect`: ojos flotantes |
| Símbolo de paz ✌ (held 400ms) | `lGestureDetector` — MediaPipe 'Left' hand | Activa escucha de voz (Web Speech API) |

### Comandos de voz (requieren símbolo de paz activo)

| Frase | Efecto |
|-------|--------|
| "Chisme Potente" | `ChismePotente`: GlitchPass + audio corneta (Web Audio API, pre-decoded) |
| "Caliente" | `CalienteOverlay`: hot.png centrado con bounce-in + pulso glow naranja/rojo + explosion.mp3 |
| "Super Elegante" | `MemeOverlay`: ariel.png en burbuja dorada |

### Expresiones faciales (MediaPipe FaceLandmarker, blendshapes)

| Expresión | Detección | Efecto |
|-----------|-----------|--------|
| Escéptico (ojos entrecerrados + cejas bajas + boca cerrada) | `expressionDetector.detectAmazement` | `SpiderSenseEffect`: wireframe vibrante alrededor del rostro |
| Sonrisa amplia (jawOpen > 0.2 + mouthSmile > 0.4) | `detectRisaMalevola` | `MemeOverlay`: risaMalevola |
| Ojos muy abiertos | `detectSorprendido` | `MemeOverlay`: sorprendido |
| Ceja interior arriba + boca cerrada | `detectPreocupado` | `MemeOverlay`: preocupado |
| Comisuras hacia abajo + boca cerrada | `detectSmug` | `MemeOverlay`: smug |

### Código presente pero NO activo

- `clapDetector`: importado en `useHandTracking` pero nunca llamado
- `BubblesEffect`: stub, no registrado en `SceneManager`
- `MirrorEffect`: registrado pero comentado en `SceneManager.init()`

## Arquitectura del código

```
src/
  App.jsx                      — Raíz: toggle landing/app con useState, orquesta hooks
  context/AppContext.jsx        — Estado global compartido (efectos activos, landmarks refs)
  hooks/
    useHandTracking.js          — MediaPipe Hands, loop de detección, llama detectores
    useFaceTracking.js          — MediaPipe Face Landmarker, memes + spider sense
    useThreeScene.js            — Inicializa y conecta SceneManager con React
    useSpeechRecognition.js     — Web Speech API, detecta "chisme potente" / "caliente" / "super elegante"
  gestures/
    verticalHandDetector.js     — Puño izq + todos dedos der (portal trigger)
    triangleDetector.js         — Proximidad índice+pulgar (snap/tercer ojo)
    lGestureDetector.js         — Símbolo de paz ✌ (activa escucha de voz)
    expressionDetector.js       — Blendshapes: spider sense + memes Homelander
    snapDetector.js             — (legacy, ver triangleDetector)
    clapDetector.js             — Importado pero no conectado
  components/
    LandingPage.jsx             — Pantalla inicial con nebulosa Three.js
    StreamLayout.jsx            — Layout principal: canvas + HUD + overlays
    CanvasOverlay.jsx           — Canvas Three.js
    HUDOverlay.jsx              — Chips de estado en la parte inferior del canvas
    ModalitiesPanel.jsx         — Panel derecho con estado de modalidades e historial
    MemeOverlay.jsx             — Burbuja dorada con memes (Homelander + ariel)
    CalienteOverlay.jsx         — Overlay dramático hot.png con animación CSS + audio
  three/
    SceneManager.js             — Gestiona escena Three.js, efectos, loop de render
    VideoPlane.js               — Plano con textura de vídeo de la webcam
    effects/
      PortalEffect.js           — Swirl shader + poster de película
      SnapAuraEffect.js         — Aura verde + ojo 3D
      SpiderSenseEffect.js      — Wireframe vibrante spider-sense
      ParallaxEffect.js         — Ojos flotantes con parallax facial
      ChismePotente.js          — GlitchPass + audio pre-decoded
      MirrorEffect.js           — (comentado en SceneManager)
      BubblesEffect.js          — (stub, no registrado)
  styles/
    theme.css                   — Variables CSS: colores, fuentes, glows, keyframes
    panel.css                   — Estilos de todos los componentes + landing + overlays
  utils/
    coordUtils.js               — normalizedToWorld(), keypointCenter(), planeDimensions
```

## Convenciones de código

- Efectos Three.js siguen interfaz: `constructor()`, `init(scene)`, `update(deltaTime, faceLandmarks, handDetections)`, `setActive(bool)`, `dispose()`
- Los hooks devuelven refs (no state) para datos de alta frecuencia (landmarks a 30fps)
- Face tracking activo siempre (expresiones faciales siempre monitorizadas)
- Coordenadas MediaPipe normalizadas [0,1] → usar `normalizedToWorld()` de `coordUtils.js`
- Variables configurables en `.env` con prefijo `VITE_`

## Lo que NO está en scope

- Grabación de vídeo interna
- Avatares animados complejos
- Escenarios 3D elaborados
- Configuración dinámica de gestos en UI
