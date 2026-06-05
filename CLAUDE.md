Eres experto en HCI multimodal, React, three js, rapier, otras tecnologias que permiten interactuar humano con computadora.
tengo que realizar el siguiente proyecto
OBJETIVO
• Desarrollar prototipo aplicación multimodal
• Visualizaciones 2D 3D combinadas con entrada/salida
multimodal
• Relacionarlo con conceptos estudiados en asignatura
• Describir solución desarrollada mediante informe
TECNOLOGÍAS A UTILIZAR
• Three.js para desarrollo
• Google MediaPipe para tracking manos, cara cuerpo
• Web Speech API para reconocimiento voz
• Aplicación ejecutada en navegador web

mi proyecto propuesto:

MOVE STREAM
MOTIVACIÓN PROYECTO
streamers actuales controlan sus efectos visuales usando teclado, StreamDeck botones físicos. Esto implica:

Apartar vista cámara en momentos clave
Romper contacto visual con audiencia
Perder reacción genuina por buscar botón correcto
Necesitar técnico adicional para producciones más elaboradas

Esto implica:
OBJETIVO
Desarrollar prototipo asistente efectos para
streaming que permita activar overlays efectos visuales
en tiempo real mediante gestos, voz expresiones
faciales sin tocar ningún dispositivo durante transmisión.
PUNTOS CLAVE
Navegador web
Se integra con OBS
 streamer usa su comportamiento natural
ENTRADAS

IDEAL
4 gestos manos
3 palabras clave voz
1 expresión facial
Efectos Three.js: partículas, cambios
 color, overlays simples
Efectos audio pre-existentes
NICE TO HAVE
Escenarios 3D complejos
Avatares animados
Grabación vídeo interna

Estado actual:
Temática Dr. Strange / comics. Landing page con nebulosa Three.js → pantalla principal.

GESTOS DE MANO
1. Puño izquierda + todos dedos extendidos mano derecha → Portal ✅ LISTO
   Detección: verticalHandDetector — requiere exactamente 2 manos, handedness MediaPipe
   Efecto: PortalEffect (swirl shader + poster de película)

2. Triángulo (índice+pulgar proximidad) → Tercer Ojo ✅ LISTO
   Detección: triangleDetector — proximidad landmarks
   Efecto: SnapAuraEffect (aura verde + ojo 3D) + ParallaxEffect (ojos flotantes con face tracking)

3. Símbolo de paz (V, índice+medio extendidos) → Activa escucha de voz ✅ LISTO
   Detección: lGestureDetector — hold 400ms
   Efecto: Activa Web Speech API

COMANDOS DE VOZ (requieren símbolo de paz activo)
4. "Chisme Potente" → Glitch + audio corneta ✅ LISTO
   Efecto: ChismePotente (GlitchPass + Web Audio API pre-decoded)

5. "Caliente" → Overlay dramático hot.png + audio explosión ✅ LISTO
   Efecto: CalienteOverlay (CSS pulse+glow, explosion.mp3)

6. "Super Elegante" → Meme Ariel en burbuja dorada ✅ LISTO
   Efecto: MemeOverlay con ariel.png

EXPRESIONES FACIALES
7. Expresión escéptica (ojos entrecerrados + cejas bajas) → Spider Sense ✅ LISTO
   Detección: expressionDetector.detectAmazement — face blendshapes
   Efecto: SpiderSenseEffect (wireframe vibrante alrededor del rostro)

8. Expresiones Homelander → Memes en burbuja dorada ✅ LISTO
   Detección: expressionDetector (risaMalevola, sorprendido, preocupado, smug)
   Efecto: MemeOverlay (burbuja circular animada, esquina inferior derecha)

NO ACTIVOS (código presente pero desconectado)
- clapDetector: importado en useHandTracking, nunca llamado
- BubblesEffect: stub, no registrado en SceneManager
- MirrorEffect: registrado pero comentado en SceneManager.init()
