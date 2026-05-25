class VerticalHandDetector {
  constructor() {
    this.debounceMs = parseInt(import.meta.env.VITE_PORTAL_DEBOUNCE_MS) || 500;
    this.cooldownMs = 200;
    this.gestureFirstSeenTime = null;
    this.lastDetectionTime = 0;
    this.wasActive = false;
  }

  detect(landmarks) {
    const now = Date.now();

    // Require exactly 1 hand — prevents false positives from two-hand gestures
    if (!landmarks || landmarks.length !== 1) {
      this.gestureFirstSeenTime = null;
      if (now - this.lastDetectionTime > this.cooldownMs) {
        this.wasActive = false;
      }
      return this.wasActive;
    }

    const hand = landmarks[0];
    const wrist = hand[0];
    const indexTip = hand[8];
    const middleTip = hand[12];
    const ringTip = hand[16];

    if (!wrist || !indexTip || !middleTip || !ringTip) return this.wasActive;

    // Check if middle finger is pointing up (y is inverted, so smaller y is higher)
    const isUpright = middleTip.y < wrist.y;

    // Extension check: distance in Y should be at least 8% of screen height
    const extensionY = wrist.y - middleTip.y;
    const isExtended = extensionY > 0.08;

    // Check fingers are open (tip further from wrist than knuckle)
    const middleMCP = hand[9];
    const isOpen = middleMCP ? (wrist.y - middleTip.y > wrist.y - middleMCP.y) : true;

    const isGestureNow = isUpright && isExtended && isOpen;

    if (isGestureNow) {
      if (this.gestureFirstSeenTime === null) {
        this.gestureFirstSeenTime = now;
      }
      // Only activate after gesture has been held continuously for debounceMs
      if (now - this.gestureFirstSeenTime >= this.debounceMs) {
        this.lastDetectionTime = now;
        this.wasActive = true;
      }
    } else {
      this.gestureFirstSeenTime = null;
      if (now - this.lastDetectionTime > this.cooldownMs) {
        this.wasActive = false;
      }
    }

    return this.wasActive;
  }
}

export const verticalHandDetector = new VerticalHandDetector();
