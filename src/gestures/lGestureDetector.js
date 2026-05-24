// Detects index-up gesture on the LEFT hand:
// - Index finger clearly extended upward
// - Middle, ring, pinky curled
// - Thumb position not required (more forgiving)
// Must be held for HOLD_DURATION ms before activating

const HOLD_DURATION = 400

class LGestureDetector {
  constructor() {
    this._holdStart = null
    this._isHeld = false
  }

  detect(landmarks, handedness) {
    const leftIdx = this._findLeftHand(handedness)

    if (leftIdx === -1 || !landmarks[leftIdx]) {
      this._holdStart = null
      this._isHeld = false
      return { isHeld: false }
    }

    const lm = landmarks[leftIdx]
    const valid = this._isIndexUp(lm)

    if (valid) {
      if (this._holdStart === null) this._holdStart = Date.now()
      if (Date.now() - this._holdStart >= HOLD_DURATION) this._isHeld = true
    } else {
      this._holdStart = null
      this._isHeld = false
    }

    return { isHeld: this._isHeld }
  }

  _findLeftHand(handedness) {
    if (!handedness || handedness.length === 0) return -1
    for (let i = 0; i < handedness.length; i++) {
      if (handedness[i]?.[0]?.categoryName === 'Left') return i
    }
    return -1
  }

  _isIndexUp(lm) {
    // Index extended up: tip (8) clearly above MCP (5)
    const indexExtended = lm[8].y < lm[5].y - 0.05

    // Middle, ring, pinky curled: tip.y > MCP.y
    const middleCurled = lm[12].y > lm[9].y
    const ringCurled = lm[16].y > lm[13].y
    const pinkyCurled = lm[20].y > lm[17].y

    return indexExtended && middleCurled && ringCurled && pinkyCurled
  }
}

export const lGestureDetector = new LGestureDetector()
