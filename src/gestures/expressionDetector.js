/**
 * Detecta expresiones faciales basadas en blendshapes de MediaPipe
 */
export const expressionDetector = {
  /**
   * Detecta expresión de asombro (ojos muy abiertos + boca abierta)
   * @param {Array} blendshapes - Lista de objetos {categoryName, score}
   * @param {number} frameCount - Para logs ocasionales
   * @returns {boolean}
   */
  detectAmazement(blendshapes, frameCount = 0) {
    if (!blendshapes || blendshapes.length === 0) return false

    // Mapear blendshapes para acceso fácil
    const shapes = {}
    blendshapes.forEach(s => {
      shapes[s.categoryName] = s.score
    })

    const eyeSquintL = shapes['eyeSquintLeft'] || 0
    const eyeSquintR = shapes['eyeSquintRight'] || 0
    const browDownL = shapes['browDownLeft'] || 0
    const browDownR = shapes['browDownRight'] || 0
    const jawOpen = shapes['jawOpen'] || 0

    // Log para debuguear la nueva cara
    if (frameCount % 30 === 0) {
        console.log(`Skeptic Scores - Squint: ${Math.max(eyeSquintL, eyeSquintR).toFixed(2)}, Brows: ${Math.max(browDownL, browDownR).toFixed(2)}, Mouth: ${jawOpen.toFixed(2)}`)
    }

    // Para la expresión de la imagen: Ojos achinados + cejas fruncidas + boca cerrada
    const eyesSquinted = (eyeSquintL > 0.4) || (eyeSquintR > 0.4)
    const browsDown = (browDownL > 0.3) || (browDownR > 0.3)
    const mouthClosed = jawOpen < 0.1

    return eyesSquinted && browsDown && mouthClosed
  }
}
