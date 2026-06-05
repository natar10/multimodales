// Portal trigger: left hand = fist, right hand = all fingers extended upward.
// Requires both hands visible simultaneously — eliminates single-hand false positives.
//
// NOTE: MediaPipe handedness with a front-facing camera may be mirrored.
// If portal triggers on the wrong hand combination, swap 'Left'/'Right' in _findHand calls.

const HOLD_DURATION = parseInt(import.meta.env.VITE_PORTAL_DEBOUNCE_MS) || 500
const COOLDOWN_MS = 200

class VerticalHandDetector {
  constructor() {
    this.gestureFirstSeenTime = null
    this.lastDetectionTime = 0
    this.wasActive = false
  }

  detect(landmarks, handedness) {
    const now = Date.now()

    if (!landmarks || landmarks.length !== 2 || !handedness || handedness.length !== 2) {
      this.gestureFirstSeenTime = null
      if (now - this.lastDetectionTime > COOLDOWN_MS) this.wasActive = false
      return this.wasActive
    }

    const leftIdx  = this._findHand(handedness, 'Right')
    const rightIdx = this._findHand(handedness, 'Left')

    if (leftIdx === -1 || rightIdx === -1) {
      this.gestureFirstSeenTime = null
      if (now - this.lastDetectionTime > COOLDOWN_MS) this.wasActive = false
      return this.wasActive
    }

    // Left hand (MediaPipe 'Right') = fist, Right hand (MediaPipe 'Left') = all fingers extended vertically
    const isFist     = this._isFist(landmarks[leftIdx])
    const isVertical = this._isAllFingersUp(landmarks[rightIdx])
    const isGestureNow = isFist && isVertical

    if (isGestureNow) {
      if (this.gestureFirstSeenTime === null) this.gestureFirstSeenTime = now
      if (now - this.gestureFirstSeenTime >= HOLD_DURATION) {
        this.lastDetectionTime = now
        this.wasActive = true
      }
    } else {
      this.gestureFirstSeenTime = null
      if (now - this.lastDetectionTime > COOLDOWN_MS) this.wasActive = false
    }

    return this.wasActive
  }

  _findHand(handedness, label) {
    for (let i = 0; i < handedness.length; i++) {
      if (handedness[i]?.[0]?.categoryName === label) return i
    }
    return -1
  }

  // All 4 fingertips curled below their MCP knuckle (y increases downward)
  _isFist(lm) {
    return (
      lm[8].y  > lm[5].y  &&   // index
      lm[12].y > lm[9].y  &&   // middle
      lm[16].y > lm[13].y &&   // ring
      lm[20].y > lm[17].y      // pinky
    )
  }

  // All 4 fingertips clearly above their MCP knuckle (pointing up)
  _isAllFingersUp(lm) {
    return (
      lm[8].y  < lm[5].y  &&   // index
      lm[12].y < lm[9].y  &&   // middle
      lm[16].y < lm[13].y &&   // ring
      lm[20].y < lm[17].y      // pinky
    )
  }
}

export const verticalHandDetector = new VerticalHandDetector()
