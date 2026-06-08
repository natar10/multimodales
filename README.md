# MoveStream

Prototipo de aplicación multimodal para streaming que permite activar efectos visuales en tiempo real mediante **gestos de mano**, **expresiones faciales** y **comandos de voz**, sin tocar ningún dispositivo.

## Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- Navegador **Chrome** (recomendado - Para evitar incompatibilidades con Web Speech API)
- Webcam y micrófono

## Instalación

```bash
npm install
```

## Iniciar

```bash
npm run dev
```

Abre `http://localhost:5173` en Chrome y concede permisos de cámara y micrófono.

## Interacciones disponibles

| Entrada | Gesto / Expresión | Efecto |
|---|---|---|
| Mano | Puño izq. + dedos der. extendidos | Portal Dr. Strange |
| Mano | Triángulo índice–pulgar | Tercer Ojo + parallax |
| Mano | Símbolo de paz (V) | Activa escucha de voz |
| Voz | "Chisme Potente" | Glitch visual + corneta |
| Voz | "Caliente" | Overlay hot + explosión |
| Voz | "Super Elegante" | Meme Ariel |
| Cara | Expresión escéptica | Spider Sense |
| Cara | Risa malévola / sorpresa / preocupación / smug | Meme Homelander |

> Los comandos de voz requieren tener el símbolo de paz activo.

## Uso con OBS

1. Abrir la aplicación en Chrome
2. En OBS: **Fuente → Captura de ventana** (o Virtual Camera del navegador)
3. Los overlays quedan superpuestos sobre el vídeo de la webcam
