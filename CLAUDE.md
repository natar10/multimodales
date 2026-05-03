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
TÉCNICAS AVANZADAS INTERACCIÓN MULTIMODAL
Mario Corrales Astorgano
mario.corrales@uva.es
Curso 2025/2026
INTRODUCCIÓN ¿En qué
consiste 
proyecto?
OBJETIVO
• Desarrollar prototipo aplicación multimodal
• Visualizaciones 2D 3D combinadas con entrada/salida
multimodal
• Relacionarlo con conceptos estudiados en asignatura
• Describir solución desarrollada mediante informe
Curso 2025/2026 Presentación proyecto 3
TECNOLOGÍAS A UTILIZAR
• Three.js para desarrollo
• Google MediaPipe para tracking manos, cara cuerpo
• Web Speech API para reconocimiento voz
• Aplicación ejecutada en navegador web
Curso 2025/2026 Presentación proyecto 4
ENTREGAS 
EVALUACIÓN
Fechas, qué
hay que
entregar 
cómo se evalúa
P1: PROPUESTA
• En segunda sesión clase, se hará pequeña presentación (≈ 5
minutos) para ver propuestas cada alumno poder recibir feedback
sobre mismas.
• Para alumnado modalidad online, se entregará video con 
explicación propuesta. El profesor proporcionará feedback posteriormente.
• 10% nota final
• Fecha presentación/entrega: 29 abril a 23:59
Curso 2025/2026 Presentación proyecto 6
P2: VERSIÓN FINAL PROTOTIPO +VERSIÓN
FINAL ENSAYO + DEFENSA
• Tras correcciones feedback propuesta, se seguirá trabajando para conseguir
 versión final a entregar
• Se debe entregar:
• Versión final prototipo aplicación
• Versión final informe
• Además, se realizará defensa síncrona (tanto presencial como online)
• 70% nota final
• Fecha entrega: 11 junio a 23:59
• Fecha defensa: 11 junio a 18:00 (presencial) 12 junio a 16:00 (online).
Se contactará con estudiantes para organizar turnos defensa
Curso 2025/2026 Presentación proyecto 7
ENTREGABLES
Descripción 
cada
entregable
PROPUESTA PROYECTO (10%)
• Breve presentación aproximadamente 5 minutos en que
se presenta problema, objetivo solución a desarrollar
• Se debe realizar bocetos con idea propuesta
utilizando alguna herramienta bocetaje/prototipado.
• Se recibirá feedback por parte profesor 
compañeros para tratar mejorar idea
Curso 2025/2026 Presentación proyecto 9
PROTOTIPO APLICACIÓN (35%)
• Prototipo aplicación multimodal
• Versión final: sistema a entregar que sea capaz mostrar 
funcionalidades propuestas en principio. No deja de ser un
prototipo.
Curso 2025/2026 Presentación proyecto 10
ENSAYO O INFORME (15%)
• Se proporcionará rúbrica con estructura secciones
recomendadas
• Máximo 10 páginas
• Hacer hincapié en conceptos estudiados en asignatura
Curso 2025/2026 Presentación proyecto 11
DEFENSA (20%)
• Presentación entre 5 10 minutos aproximadamente
• Motivación objetivo aplicación multimodal
• Destacar ventajas multimodalidad sistema
• Relacionarlo con conceptos estudiados en asignatura
• Ronda preguntas
Curso 2025/2026 Presentación proyecto 12
SOPORTE
¿Cómo me
ayuda 
profesor?
SOPORTE
• Foro dudas Campus Virtual
• Feedback en entregas en clases laboratorio
• Consultas por email
• Tutorías personalizadas (pedir por email)
Curso 2025/2026 Presentación proyecto 14


Basado en estas pero no unicamente tecnologias:

Tecnologías para 
proyecto
INTERFACES GRÁFICAS ENTORNOS VIRTUALES
Mario Corrales Astorgano/ Juan Carlos Garrote Gascón
mario.corrales@uva.es
Curso 2025/2026
THREE.JS Fundamentos
 Three.js
INFORMACIÓN BÁSICA
• WebGL (Web Graphics Library) API implementada en
JavaScript para JavaScript, que permite representación gráficos 2D
 3D interactivos en cualquier navegador web estándar sin necesidad 
plugins. Permite trabajo a bajo nivel.
• Three.js biblioteca open-source implementada en JavaScript para
JavaScript, que proporciona API que permite representar gráficos 3D
en navegadores web, utilizando WebGL para ello. Permite trabajo a alto
nivel.
Curso 2025/2026 Tecnologías para proyecto 3
INFORMACIÓN BÁSICA
• Con Three.js podemos crear representaciones gráficas compuestas por
escenas, en que podemos modificar:
• Cámara
• Luces
• Materiales
• Texturas
• …
Curso 2025/2026 Tecnologías para proyecto 4
ESTRUCTURA UN PROYECTO THREE.JS
• Fichero HTML5: puesto que visualización estará alojada en 
página web, necesitamos menos fichero HTML con enlace a 
biblioteca Three.js estructura canvas.
• Fichero JavaScript: será donde esté código que defina 
visualizaciones a mostrar utilizando Three.js.
• (Opcional) Fichero CSS3: para dar estilo a página web, fichero
HTML se debe complementar con fichero CSS.
Curso 2025/2026 Tecnologías para proyecto 5
FICHERO HTML5
• La biblioteca Three.js se puede importar…
• Localmente:
<script type=“text/javascript” charset=“UTF-8” src =“../../libs/three/three.js"></script>
• Vía Internet:
<script src=‘https://cdnjs.cloudflare.com/ajax/libs/three.js/105/three.min.js’></script>
Curso 2025/2026 Tecnologías para proyecto 6
FICHERO HTML5
<!DOCTYPE html>
<html>
<head>
<title>Título de la web</title>
<meta charset="UTF-8" />
<!-- Via Internet -->
<script src='https://cdnjs.cloudflare.com/ajax/libs/three.js/105/three.min.js'></script>
<script type="text/javascript" src=“ejemplo.js"></script>
<link rel="stylesheet" href="../css/ejemplo.css">
</head>
<body>
<div id="canvas"></div>
<!-- Código para ejecutar función init fichero JavaScript -->
<script type="text/javascript">
(function () {
init()
})();
</script>
</body>
</html>
Curso 2025/2026 Tecnologías para proyecto 7
FICHERO CSS3 (OPCIONAL)
html, body {
height: 100%;
margin: 0;
}
#canvas {
width: 400pt;
height: 400pt;
display: block;
background-color:grey;
}
Curso 2025/2026 Tecnologías para proyecto 8
FICHERO JAVASCRIPT
'use strict';
function init() {
// El código JavaScript utilizando Three.js que necesitemos para representar 
// información gráfica
}
Curso 2025/2026 Tecnologías para proyecto 9
APLICACIÓN CON THREE.JS
Curso 2025/2026 Tecnologías para proyecto 10
Fuente: https://threejs.org/manual/#en/fundamentals
• Renderer: objeto que dibuja escena 3D
desde punto vista cámara. Por ello, se
le pasa Scene Camera.
• Scene: árbol que se le van añadiendo objetos
que representar en escena, con relación padre/hijo
( hijos se posicionan orientan forma relativa
a padres, por ejemplo, coche sus ruedas).
Define color fondo niebla.
• Camera: no necesita escena para
funcionar. Puede haber múltiples cámaras para
tener múltiples vistas.
APLICACIÓN CON THREE.JS
Curso 2025/2026 Tecnologías para proyecto 11
Fuente: https://threejs.org/manual/#en/fundamentals
• Mesh: objeto Geometry + objeto Material
• Geometry: vértices figura geométrica.
Existen primitivas geométricas rápidas construir,
pero se pueden crear nuevas cargarlas a partir
 ficheros.
• Material: propiedades superficie utilizada
para construir geometrías (color, brillo…). Puede
hacer referencia a varias Texture.
• Texture: imágenes que se pegan a superficies.
APLICACIÓN CON THREE.JS
Curso 2025/2026 Tecnologías para proyecto 12
Fuente: https://threejs.org/manual/#en/fundamentals
• Light: representa luz escena que 
contiene (luz ambiente, direccional, punto luz…)
RENDERER
• El Renderer crea canvas dentro nodo <body> HTML. El tamaño del canvas 
difícil controlar, por que se puede crear bloque <div> pedir Renderer que 
añada a él:
const renderer = new THREE.WebGLRenderer();
renderer.setSize(1000, 500);
renderer.setClearColor(new THREE.Color(0xFFFFFF));
document.getElementById("container").appendChild(renderer.domElement);
• Para finalmente pedir que renderice escena con cámara:
renderer.render(scene, camera);
Curso 2025/2026 Tecnologías para proyecto 13
SCENE
• objeto Scene contendrá todos elementos que queramos representar en escena,
que se irán añadiendo:
const scene = new THREE.Scene();
...
scene.add(light);
...
scene.add(house);
• Como estamos trabajando con representaciones 3D, ejes representación X+,
Y+ Z+.
Curso 2025/2026 Tecnologías para proyecto 14
CAMERA
• Los objetos renderizados serán que se encuentren dentro frustum (campo visión) 
objeto Camera. Existen dos tipos principales: ortogonal perspectiva.
Curso 2025/2026 Tecnologías para proyecto 15
• Normalmente utilizaremos proyección perspectiva para
que distancia a cámara sea relevante. La cámara se
construye, se define su posición dentro escena a
dónde apunta:
const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 1000);
camera.position.set(-10, 10, 10);
camera.lookAt(0, 0, 0); Fuente: https://medium.com/@saturnozmarte/09-
usando-matrices-a5e1680cd5cc
GEOMETRY
• Existen primitivas geométricas en 2D (CircleGeometry, PlaneGeometry,
ShapeGeometry…) en 3D (BoxGeometry, SphereGeometry, CylinderGeometry…). Las
primitivas están listadas en:
• https://threejs.org/manual/#en/primitives
• https://threejs.org/docs/index.html (sección “Geometries”)
• primitivas geométricas 2D se crean en vertical utilizando ejes X Y. Si se desea
modificar esa disposición, más adecuado crear objeto Mesh, incluir primitiva
deseada modificar su orientación.
• EdgeGeometry WireframeGeometry envoltorios helpers para otras geometrías que
muestran aristas entre distintos vértices (ejemplo).
Curso 2025/2026 Tecnologías para proyecto 16
MATERIAL
• objetos Material definen cómo superficies objeto Geometry. Los
materiales disponibles listados en:
• https://threejs.org/manual/#en/materials
• https://threejs.org/docs/index.html (sección “Materials”)
Curso 2025/2026 Tecnologías para proyecto 17
MESH
• vez que tengamos objeto Geometry objeto Material, podemos asociarlos
mediante objeto Mesh:
const exampleGeometry = new THREE.BoxGeometry(5, 5, 5);
const exampleMaterial = new THREE.MeshLambertMaterial({color: 0x0066ff});
const exampleMesh = new THREE.Mesh(exampleGeometry, exampleMaterial);
Curso 2025/2026 Tecnologías para proyecto 18
TEXTURE
• Un objeto Texture se puede asociar a objeto Material para obtener imagen
dibujada en superficie geometría:
const loader = new THREE.TextureLoader();
materialWithImage = new THREE.MeshBasicMaterial({map: loader.load(image.jpg')});
• Después uso inicial textura, sus propiedades no se pueden cambiar. Para
poder modificar textura, se debe llamar a función.dispose() instanciar 
nueva.
Curso 2025/2026 Tecnologías para proyecto 19
LIGHT
• Existen cuatro tipos principales luz:
• AmbientLight: fuente luz global para ver modelo (no proyecta sombras porque no tiene dirección).
Se le puede dar color:
const color = 0xFFFFFF;
const ambientLight = new THREE.AmbientLight(color);
• PointLight: fuente luz puntual que ilumina en todas direcciones (como bombilla). Se puede
configurar su color, intensidad, distancia, posición visibilidad. Por defecto no proyecta sombras, pero se
puede cambiar:
const color = 0xFFFFFF;
const pointLight = new THREE.PointLight(color);
pointLight.distance = 100;
pointLight.castShadow = true;
Curso 2025/2026 Tecnologías para proyecto 20
LIGHT
• SpotLight: fuente luz con efecto cono (como linterna). Se puede configurar mismo que a PointLight, 
adicionalmente ángulo objetivo que apunta. Por defecto no proyecta sombras:
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-10, 20, -5);
spotLight.castShadow = true;
spotLight.target = house;
• DirectionalLight: fuente luz lejana que produce rayos paralelos a superficie (como sol). Por defecto no
proyecta sombras:
const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.castShadow = true;
• Se suele utilizar más luz incluso más tipo para iluminar bien escena.
Curso 2025/2026 Tecnologías para proyecto 21
DESPLIEGUE APLICACIÓN
• Normalmente no necesario despliegue como tal aplicación para poder
visualizarla, bastaría con referenciar correctamente fichero JavaScript desde 
fichero HTML abrir fichero HTML con navegador web.
• PERO si nos dan guerra restricciones CORS, podemos desplegar 
servidor simple con node en directorio donde se encuentran archivos para evitarlo.
Ejemplo: npx serve. –l 5500 crea servidor despliega en localhost:5500