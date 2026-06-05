const INDEX_TIP = 8
const THUMB_TIP = 4

const INDEX_TOUCH_THRESHOLD = 0.10
const MIN_BASE_WIDTH        = 0.08
const HOLD_DURATION         = 600
const COOLDOWN              = 1500

class TriangleDetector {
  constructor() {
    this.holdStartTime = null
    this.triggered = false
    this.cooldownEnd = 0
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
    if (!allLandmarks || allLandmarks.length < 2) return false

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

    return indexDist <= INDEX_TOUCH_THRESHOLD
        && idxAboveThumbA
        && idxAboveThumbB
        && thumbDist >= MIN_BASE_WIDTH
  }
}

export const triangleDetector = new TriangleDetector()
