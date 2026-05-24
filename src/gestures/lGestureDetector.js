// Detects "L" shape on the RIGHT hand:
// - Index finger extended upward
// - Thumb extended horizontally (away from index)
// - Middle, ring, pinky curled
// Must be held for HOLD_DURATION ms before activating

const HOLD_DURATION = 400

class LGestureDetector {
  constructor() {
    this._holdStart = null
    this._isHeld = false
  }

  detect(landmarks, handedness) {
    const rightIdx = this._findRightHand(handedness)

    if (rightIdx === -1 || !landmarks[rightIdx]) {
      this._holdStart = null
      this._isHeld = false
      return { isHeld: false }
    }

    const lm = landmarks[rightIdx]
    const valid = this._isLShape(lm)

    if (valid) {
      if (this._holdStart === null) this._holdStart = Date.now()
      if (Date.now() - this._holdStart >= HOLD_DURATION) this._isHeld = true
    } else {
      this._holdStart = null
      this._isHeld = false
    }

    return { isHeld: this._isHeld }
  }

  _findRightHand(handedness) {
    if (!handedness || handedness.length === 0) return -1
    for (let i = 0; i < handedness.length; i++) {
      if (handedness[i]?.[0]?.categoryName === 'Right') return i
    }
    return -1
  }

  _isLShape(lm) {
    // Index extended up: tip (8) clearly above MCP (5)
    const indexExtended = lm[8].y < lm[5].y - 0.05

    // Thumb extended out: tip (4) far from index base (5), roughly horizontal
    const thumbDist = Math.hypot(lm[4].x - lm[5].x, lm[4].y - lm[5].y)
    const thumbExtended = thumbDist > 0.15 && Math.abs(lm[4].y - lm[5].y) < 0.18

    // Other fingers curled: tip.y > MCP.y (tip below base = curled)
    const middleCurled = lm[12].y > lm[9].y
    const ringCurled = lm[16].y > lm[13].y
    const pinkyCurled = lm[20].y > lm[17].y

    return indexExtended && thumbExtended && middleCurled && ringCurled && pinkyCurled
  }
}

export const lGestureDetector = new LGestureDetector()
