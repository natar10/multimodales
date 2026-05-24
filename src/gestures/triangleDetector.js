// Detecta el gesto de triángulo: ambas manos con los índices tocándose arriba
// y los pulgares separados abajo, formando una figura triangular.

const INDEX_TIP = 8
const THUMB_TIP = 4

const INDEX_TOUCH_THRESHOLD = 0.10  // distancia máxima entre los dos índices
const MIN_BASE_WIDTH        = 0.08  // separación mínima entre los dos pulgares
const HOLD_DURATION         = 600   // ms que hay que mantener el gesto para activar
const COOLDOWN              = 1500  // ms entre activaciones

class TriangleDetector {
  constructor() {
    this.holdStartTime = null
    this.triggered = false
    this.cooldownEnd = 0
    this._lastLogTime = 0  // throttle de logs de distancia
  }

  detect(allLandmarks) {
    const now = Date.now()

    if (now < this.cooldownEnd) return false

    const isTriangle = this._isTriangle(allLandmarks)

    if (isTriangle) {
      if (this.holdStartTime === null) {
        this.holdStartTime = now
        this.triggered = false
      }
      if (!this.triggered && now - this.holdStartTime >= HOLD_DURATION) {
        this.triggered = true
        this.cooldownEnd = now + COOLDOWN
        return true
      }
    } else {
      this.holdStartTime = null
      this.triggered = false
    }

    return false
  }

  _isTriangle(allLandmarks) {
    if (!allLandmarks || allLandmarks.length < 2) {
      //console.log('[Triangle] ❌ Manos detectadas:', allLandmarks?.length ?? 0, '(necesita 2)')
      return false
    }

    const handA = allLandmarks[0]
    const handB = allLandmarks[1]
    if (!handA || !handB) return false

    const idxA = handA[INDEX_TIP]
    const idxB = handB[INDEX_TIP]
    const thmA = handA[THUMB_TIP]
    const thmB = handB[THUMB_TIP]
    if (!idxA || !idxB || !thmA || !thmB) return false

    const indexDist      = Math.hypot(idxA.x - idxB.x, idxA.y - idxB.y)
    const thumbDist      = Math.hypot(thmA.x - thmB.x, thmA.y - thmB.y)
    const idxAboveThumbA = idxA.y < thmA.y
    const idxAboveThumbB = idxB.y < thmB.y

    // Log de métricas cada 1 segundo para no spamear
    const now = Date.now()
    if (now - this._lastLogTime > 1000) {
      this._lastLogTime = now
      console.log(
        `[Triangle] índices=${indexDist.toFixed(3)}/${INDEX_TOUCH_THRESHOLD} | ` +
        `pulgares=${thumbDist.toFixed(3)}/${MIN_BASE_WIDTH} | ` +
        `idxSobreA=${idxAboveThumbA} idxSobreB=${idxAboveThumbB}`
      )
    }

    if (indexDist > INDEX_TOUCH_THRESHOLD) return false
    if (!idxAboveThumbA || !idxAboveThumbB) {
      console.log('[Triangle] ❌ Índices no están sobre los pulgares')
      return false
    }
    if (thumbDist < MIN_BASE_WIDTH) {
      console.log('[Triangle] ❌ Pulgares muy juntos')
      return false
    }

    console.log('[Triangle] ✅ Gesto válido — hold:', this.holdStartTime ? `${now - this.holdStartTime}ms / ${HOLD_DURATION}ms` : 'iniciando...')
    return true
  }
}

export const triangleDetector = new TriangleDetector()
