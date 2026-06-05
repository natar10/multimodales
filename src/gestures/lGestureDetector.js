const HOLD_DURATION = 400

class LGestureDetector {
  constructor() {
    this._holdStart = null
    this._isHeld = false
  }

  detect(landmarks, handedness) {
    const now = Date.now()
    const targetIdx = this._findHand(handedness, 'Left')

    if (targetIdx === -1 || !landmarks[targetIdx]) {
      this._holdStart = null
      this._isHeld = false
      return { isHeld: false }
    }

    const { valid } = this._checkConditions(landmarks[targetIdx])

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
    const indexExtended  = lm[8].y  < lm[5].y  - 0.05
    const middleExtended = lm[12].y < lm[9].y  - 0.05
    const ringCurled     = lm[16].y > lm[13].y
    const pinkyCurled    = lm[20].y > lm[17].y
    const valid = indexExtended && middleExtended && ringCurled && pinkyCurled
    return { indexExtended, middleExtended, ringCurled, pinkyCurled, valid }
  }
}

export const lGestureDetector = new LGestureDetector()
