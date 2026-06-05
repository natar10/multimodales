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
Listado de efectos para streamer con tematica dr strange y comics.

1. Portal circular + poster de película - LISTO
Detección: Historial de posiciones de mano → patrón circular (puedo rastrear últimos ~30 frames)
Efecto: Three.js swirl shader + plane con textura de poster
2. Mano en forma de triangulo →  + tercer ojo ✅ LISTO
Detección: Proximidad entre índice y pulgar (solo 2 landmarks)
Efectos: Esfera con material emisor + mesh 3D de ojo, animación de escala
3. Voz "Chisme Potente" → cambiar el fondo + audio LISTO
Detección: Web Speech API nativa en navegador
Efecto: Shader de fracturas/distorsión o duplicación de pantalla, audio clip tipo cornerta
4. Expresión de asombro → spider sense (aristas vibrantes) ✅ LISTO
Detección: Face landmarks → ojos bien abiertos + boca abierta
Efecto: Lines/wireframe 3D alrededor del rostro, animación de vibración
