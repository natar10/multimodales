Listado de efectos para streamer con tematica dr strange y comics.

1. Portal circular + poster de película - TODO
Detección: Historial de posiciones de mano → patrón circular (puedo rastrear últimos ~30 frames)
Efecto: Three.js swirl shader + plane con textura de poster
Complejidad: Media | Tiempo: ~2-3 horas
2. Mano en forma de triangulo →  + tercer ojo ✅ LISTO
Detección: Proximidad entre índice y pulgar (solo 2 landmarks)
Efectos: Esfera con material emisor + mesh 3D de ojo, animación de escala
Complejidad: Baja | Tiempo: ~1-2 horas
3. Voz "Chisme Potente" → cambiar el fondo + audio TODO
Detección: Web Speech API nativa en navegador
Efecto: Shader de fracturas/distorsión o duplicación de pantalla, audio clip tipo cornerta
Complejidad: Baja | Tiempo: ~1-2 horas

5. Expresión de asombro → spider sense (aristas vibrantes) ✅ LISTO
Detección: Face landmarks → ojos bien abiertos + boca abierta
Efecto: Lines/wireframe 3D alrededor del rostro, animación de vibración
Complejidad: Media | Tiempo: ~2-3 horas


Resumen General
Temáticamente cohesionado — cada interacción tiene sentido con Dr. Strange
Pragmatismo — hardcoded = sin rabbit holes de configuración
Desafío académico balanceado — suficientemente complejo para justificar 35% del prototipo, pero alcanzable
Única Consideración/Pregunta:

El proyecto en cuestion se encuentra en la raiz pueedes leer package.json y App.jsx y main.jsx para que puedas ir guiandote. Los efectos estan siendo lanzados desde src\three\SceneManager.js
