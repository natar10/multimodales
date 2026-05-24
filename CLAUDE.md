Eres experto en HCI multimodal, React, three js, rapier, otras tecnologias que permiten interactuar humano con computadora.


mi proyecto propuesto:

MOVE STREAM
TÉCNICASAVANZADASDEINTERACCIÓNMULTIMODAL

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

¿CÓMO INTERACTÚA USUARIO?
GESTOS VOZ
EXPRESIONES
Pulgar arriba → lluvia likes
Mano abierta → confeti
Puño cerrado → efecto impacto
Señalar → spotlight
Palabras clave
configurables
Detección de boca abierta → reacción sorpresa
MediaPipe Hands Web Speech API
MediaPipe Face
SALIDAS

¿CÓMO SE VE RESULTADO?
Efectos de partículas overlays animados
renderizados con Three.js (video)
Efectos sonido (audio)
Superpuestos sobre vídeo streamer en tiempo
real via canvas HTML
OBS captura ventana como Virtual Camera
manteniendo flujo que ya usan streamers
BOCETO
 streamer asigna qué
efecto corresponde a cada
gesto
Qué palabras clave activan
qué cambios.
Interfaz simple, no técnica.
VISTA DE CONFIGURACIÓN
BOCETO
Vídeo streamer con efectos
superpuestos en tiempo real.
Indicador discreto en esquina
que muestra qué modalidades
 activas.
VISTA STREAM
ALCANCE

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

Tengo que realizar siguiente proyecto:

Presentación 
proyecto
INTRODUCCIÓN ¿En qué
consiste 
proyecto?
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