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
    } else if (shouldLog) {
    }

    // Try both Left and Right to see which one is the correct hand
    const leftIdx  = this._findHand(handedness, 'Left')
    const rightIdx = this._findHand(handedness, 'Right')

    // --- Log landmarks of whichever hands exist ---
    if (shouldLog) {
      if (leftIdx !== -1 && landmarks[leftIdx]) {
        const lm = landmarks[leftIdx]
        const c = this._checkConditions(lm)
      }
      if (rightIdx !== -1 && landmarks[rightIdx]) {
        const lm = landmarks[rightIdx]
        const c = this._checkConditions(lm)
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
