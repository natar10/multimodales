/**
 * Detecta expresiones faciales basadas en blendshapes de MediaPipe
 */
export const expressionDetector = {
  _toMap(blendshapes) {
    const shapes = {}
    blendshapes.forEach(s => { shapes[s.categoryName] = s.score })
    return shapes
  },

  // Spider Sense: cara de dudoso/esceptico
  detectAmazement(blendshapes, frameCount = 0) {
    if (!blendshapes || blendshapes.length === 0) return false
    const s = this._toMap(blendshapes)
    const eyesSquinted = (s['eyeSquintLeft'] || 0) > 0.4 || (s['eyeSquintRight'] || 0) > 0.4
    const browsDown    = (s['browDownLeft']  || 0) > 0.3 || (s['browDownRight']  || 0) > 0.3
    const mouthClosed  = (s['jawOpen'] || 0) < 0.1
    return eyesSquinted && browsDown && mouthClosed
  },

  // Meme: sonrisa natural con dientes (risa malévola)
  detectRisaMalevola(blendshapes) {
    if (!blendshapes || blendshapes.length === 0) return false
    const s = this._toMap(blendshapes)
    const mouthOpen  = (s['jawOpen'] || 0) > 0.2
    const wideSmileL = (s['mouthSmileLeft']  || 0) > 0.4
    const wideSmileR = (s['mouthSmileRight'] || 0) > 0.4
    return mouthOpen && wideSmileL && wideSmileR
  },

  // Meme: ambos ojos abiertos por encima de threshold (equivalente a cat_shock)
  detectSorprendido(blendshapes) {
    if (!blendshapes || blendshapes.length === 0) return false
    const s = this._toMap(blendshapes)
    const bothEyesWide = (s['eyeWideLeft'] || 0) > 0.25 && (s['eyeWideRight'] || 0) > 0.25
    const notSquinting = (s['eyeSquintLeft'] || 0) < 0.3 && (s['eyeSquintRight'] || 0) < 0.3
    return bothEyesWide && notSquinting
  },

  // Meme: cejas internas arriba + boca cerrada + sin fruncir (cara preocupada)
  detectPreocupado(blendshapes) {
    if (!blendshapes || blendshapes.length === 0) return false
    const s = this._toMap(blendshapes)
    const innerBrowUp  = (s['browInnerUp']  || 0) > 0.4
    const mouthClosed  = (s['jawOpen'] || 0) < 0.25
    const notFurrowed  = (s['browDownLeft'] || 0) < 0.3 && (s['browDownRight'] || 0) < 0.3
    return innerBrowUp && mouthClosed && notFurrowed
  },

  // Meme: comisuras hacia abajo + boca cerrada + cejas neutras (cara de "meh / unimpressed")
  detectSmug(blendshapes) {
    if (!blendshapes || blendshapes.length === 0) return false
    const s = this._toMap(blendshapes)
    const frownCorners = (s['mouthFrownLeft'] || 0) > 0.2 || (s['mouthFrownRight'] || 0) > 0.2
    const mouthClosed  = (s['jawOpen'] || 0) < 0.12
    const notSmiling   = (s['mouthSmileLeft'] || 0) < 0.2 && (s['mouthSmileRight'] || 0) < 0.2
    const browsNeutral = (s['browDownLeft'] || 0) < 0.3 && (s['browDownRight'] || 0) < 0.3
    return frownCorners && mouthClosed && notSmiling && browsNeutral
  },
}
