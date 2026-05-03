const SNAP_THRESHOLD = 0.05 // Distance threshold to detect snap
const SNAP_RELEASE = 0.08 // Distance threshold to release snap
const SNAP_COOLDOWN = 800 // ms between snaps

class SnapDetector {
  constructor() {
    this.lastSnapTime = 0
    this.prevDistance = null
    this.wasClosing = false
  }

  detect(landmarks) {
    if (!landmarks || landmarks.length === 0) {
      this.prevDistance = null
      this.wasClosing = false
      return false
    }

    const now = Date.now()
    if (now - this.lastSnapTime < SNAP_COOLDOWN) {
      return false
    }

    // Landmarks: 4 = thumb, 8 = index finger
    const thumb = landmarks[4]
    const index = landmarks[8]

    if (!thumb || !index) return false

    // Calculate distance between thumb and index
    const distance = Math.hypot(
      thumb.x - index.x,
      thumb.y - index.y,
      (thumb.z - index.z) * 0.5 // Z scale down since it's less important
    )

    // State machine: detect closing then opening
    if (distance < SNAP_THRESHOLD) {
      // Fingers are close — potential snap closing phase
      this.wasClosing = true
    } else if (this.wasClosing && distance > SNAP_RELEASE) {
      // Fingers were close, now far apart — snap detected!
      this.wasClosing = false
      this.prevDistance = distance
      this.lastSnapTime = now
      return true
    }

    this.prevDistance = distance
    return false
  }
}

export const snapDetector = new SnapDetector()
