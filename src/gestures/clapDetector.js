const CLAP_THRESHOLD = 0.15 // Distance between hands for clap
const CLAP_COOLDOWN = 1000 // ms between claps

class ClapDetector {
  constructor() {
    this.lastClapTime = 0
    this.prevDistance = null
  }

  detect(landmarks) {
    // landmarks is an array of hand poses. We need 2 hands for a clap
    if (!landmarks || landmarks.length < 2) {
      return false
    }

    const now = Date.now()
    if (now - this.lastClapTime < CLAP_COOLDOWN) {
      return false
    }

    // Get both hands
    const hand1 = landmarks[0]
    const hand2 = landmarks[1]

    if (!hand1 || !hand2) return false

    // Get palm position (landmark 9 is the palm center)
    const palm1 = hand1[9]
    const palm2 = hand2[9]

    if (!palm1 || !palm2) return false

    // Calculate distance between palms
    const distance = Math.hypot(
      palm1.x - palm2.x,
      palm1.y - palm2.y,
      (palm1.z - palm2.z) * 0.5
    )

    // Detect clap: hands are close together
    if (distance < CLAP_THRESHOLD) {
      this.lastClapTime = now
      this.prevDistance = distance
      return true
    }

    this.prevDistance = distance
    return false
  }
}

export const clapDetector = new ClapDetector()
