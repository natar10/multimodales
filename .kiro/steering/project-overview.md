# MoveStream — Dr. Strange Edition

## Qué es este proyecto

Prototipo académico para la asignatura "Técnicas Avanzadas de Interacción Multimodal" (UVa, curso 2025/2026). Es un asistente de efectos visuales para streamers que se controla con gestos, expresiones faciales y voz — sin tocar ningún dispositivo.

**Entrega final:** 11 de junio de 2026.

## Stack tecnológico

- **React 18** + **Vite** — scaffolding y UI
- **Three.js 0.184** — renderizado 3D y efectos visuales sobre canvas
- **@mediapipe/tasks-vision** — hand tracking y face tracking en el navegador
- **Web Speech API** — reconocimiento de voz nativo del navegador
- Sin backend. Todo corre en el navegador. OBS captura el canvas como Virtual Camera.

## Las 5 interacciones implementadas (temática Dr. Strange)

| # | Gesto/Entrada | Efecto | Estado |
|---|---------------|--------|--------|
| 1 | Gesto circular con la mano | Portal circular + poster de película | Implementado (`PortalEffect`) |
| 2 | Chasquido de dedos | Aura verde + tercer ojo (`SnapAuraEffect`) | Implementado |
| 3 | Aplauso | Activa face tracking + burbujas de temas Marvel alrededor del rostro (`BubblesEffect`) | Implementado |
| 4 | Voz "Chisme Potente" | Universos espejo rotos + audio (`MirrorEffect`) | Implementado |
| 5 | Expresión de asombro (ojos+boca abiertos) | Spider-sense: aristas vibrantes alrededor del rostro (`SpiderSenseEffect`) | Implementado |

## Arquitectura del código

```
src/
  App.jsx                    — Componente raíz, orquesta hooks y SceneManager
  context/AppContext.jsx     — Estado global compartido
  hooks/
    useHandTracking.js       — MediaPipe Hands, loop de detección
    useFaceTracking.js       — MediaPipe Face Landmarker, activado on-demand
    useThreeScene.js         — Inicializa y conecta SceneManager con React
  gestures/
    clapDetector.js          — Detecta aplauso (manos cerca + velocidad)
    snapDetector.js          — Detecta chasquido (proximidad índice-pulgar)
  three/
    SceneManager.js          — Gestiona escena Three.js, registro de efectos, loop de render
    VideoPlane.js            — Plano con textura de vídeo de la webcam
    effects/
      PortalEffect.js        — Efecto portal circular
      SnapAuraEffect.js      — Aura verde + ojo 3D
      BubblesEffect.js       — Burbujas de temas flotando alrededor del rostro
      MirrorEffect.js        — Efecto espejo roto / universos paralelos
      SpiderSenseEffect.js   — Wireframe vibrante spider-sense
      ParallaxEffect.js      — Efecto parallax (auxiliar)
  utils/
    coordUtils.js            — normalizedToWorld(), keypointCenter()
```

## Convenciones de código

- Todos los efectos Three.js siguen la misma interfaz: `constructor()`, `init(scene)`, `update(data)`, `setActive(bool)`, `dispose()`
- Los hooks de React devuelven refs (no state) para datos de tracking de alta frecuencia, evitando re-renders
- Face tracking se activa solo cuando un efecto que lo necesita está activo (optimización de CPU)
- Coordenadas MediaPipe son normalizadas [0,1]; usar `normalizedToWorld()` de `coordUtils.js` para convertir a espacio Three.js

## Lo que NO está en scope

- Grabación de vídeo interna
- Avatares animados complejos
- Escenarios 3D elaborados
- Configuración dinámica de gestos (todo hardcodeado — es correcto para el proyecto académico)
