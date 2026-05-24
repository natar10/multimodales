// Detects pointing gesture on the target hand.
// Logs detailed diagnostics every 800ms to diagnose hand/gesture issues.

const HOLD_DURATION = 400
const LOG_INTERVAL = 800  // ms between diagnostic logs

class LGestureDetector {
  constructor() {
    this._holdStart = null
    this._isHeld = false
    this._lastLogTime = 0
  }

  detect(landmarks, handedness) {
    const now = Date.now()
    const shouldLog = now - this._lastLogTime > LOG_INTERVAL

    // --- Log all detected hands ---
    if (shouldLog && handedness && handedness.length > 0) {
      const handsInfo = handedness.map((h, i) => `[${i}]=${h?.[0]?.categoryName}(${(h?.[0]?.score * 100).toFixed(0)}%)`).join(' ')
      console.log(`[LGesture] Manos detectadas: ${handsInfo}`)
    } else if (shouldLog) {
      console.log('[LGesture] Sin manos detectadas')
    }

    // Try both Left and Right to see which one is the correct hand
    const leftIdx  = this._findHand(handedness, 'Left')
    const rightIdx = this._findHand(handedness, 'Right')

    // --- Log landmarks of whichever hands exist ---
    if (shouldLog) {
      if (leftIdx !== -1 && landmarks[leftIdx]) {
        const lm = landmarks[leftIdx]
        console.log(
          `[LGesture] LEFT hand landmarks → ` +
          `idx8.y=${lm[8].y.toFixed(3)} idx5.y=${lm[5].y.toFixed(3)} ` +
          `(diff=${(lm[5].y - lm[8].y).toFixed(3)}) | ` +
          `mid12.y=${lm[12].y.toFixed(3)} mid9.y=${lm[9].y.toFixed(3)} | ` +
          `thumb4.y=${lm[4].y.toFixed(3)} wrist0.y=${lm[0].y.toFixed(3)}`
        )
        const c = this._checkConditions(lm)
        console.log(`[LGesture] LEFT  → indexUp=${c.indexExtended} midCurl=${c.middleCurled} ringCurl=${c.ringCurled} pinkyCurl=${c.pinkyCurled} → VALID=${c.valid}`)
      }
      if (rightIdx !== -1 && landmarks[rightIdx]) {
        const lm = landmarks[rightIdx]
        console.log(
          `[LGesture] RIGHT hand landmarks → ` +
          `idx8.y=${lm[8].y.toFixed(3)} idx5.y=${lm[5].y.toFixed(3)} ` +
          `(diff=${(lm[5].y - lm[8].y).toFixed(3)}) | ` +
          `mid12.y=${lm[12].y.toFixed(3)} mid9.y=${lm[9].y.toFixed(3)} | ` +
          `thumb4.y=${lm[4].y.toFixed(3)} wrist0.y=${lm[0].y.toFixed(3)}`
        )
        const c = this._checkConditions(lm)
        console.log(`[LGesture] RIGHT → indexUp=${c.indexExtended} midCurl=${c.middleCurled} ringCurl=${c.ringCurled} pinkyCurl=${c.pinkyCurled} → VALID=${c.valid}`)
      }
      this._lastLogTime = now
    }

    // --- Actual detection (currently using Left) ---
    const targetIdx = leftIdx
    if (targetIdx === -1 || !landmarks[targetIdx]) {
      this._holdStart = null
      this._isHeld = false
      return { isHeld: false }
    }

    const lm = landmarks[targetIdx]
    const { valid } = this._checkConditions(lm)

    if (valid) {
      if (this._holdStart === null) this._holdStart = now
      if (now - this._holdStart >= HOLD_DURATION) this._isHeld = true
    } else {
      this._holdStart = null
      this._isHeld = false
    }

    return { isHeld: this._isHeld }
  }

  _findHand(handedness, label) {
    if (!handedness || handedness.length === 0) return -1
    for (let i = 0; i < handedness.length; i++) {
      if (handedness[i]?.[0]?.categoryName === label) return i
    }
    return -1
  }

  _checkConditions(lm) {
    const indexExtended = lm[8].y < lm[5].y - 0.05
    const middleCurled  = lm[12].y > lm[9].y
    const ringCurled    = lm[16].y > lm[13].y
    const pinkyCurled   = lm[20].y > lm[17].y
    const valid = indexExtended && middleCurled && ringCurled && pinkyCurled
    return { indexExtended, middleCurled, ringCurled, pinkyCurled, valid }
  }
}

export const lGestureDetector = new LGestureDetector()
