class VerticalHandDetector {
  constructor() {
    this.cooldownMs = 200; // Small debounce to avoid flickering
    this.lastDetectionTime = 0;
    this.wasActive = false;
  }

  detect(landmarks) {
    const now = Date.now();
    if (!landmarks || landmarks.length === 0) {
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
    
    // Extension check: Distance in Y should be somewhat significant (at least 8% of screen height)
    // This allows it to work even if the hand is a bit further away or sideways.
    const extensionY = wrist.y - middleTip.y;
    const isExtended = extensionY > 0.08;

    // Check if fingers are generally open (distance from wrist to tip is greater than wrist to knuckles)
    // Knuckles are typically at index 9 for middle finger
    const middleMCP = hand[9];
    const isOpen = middleMCP ? (wrist.y - middleTip.y > wrist.y - middleMCP.y) : true;

    const isActive = isUpright && isExtended && isOpen;

    if (isActive) {
      this.lastDetectionTime = now;
      this.wasActive = true;
    } else if (now - this.lastDetectionTime > this.cooldownMs) {
      this.wasActive = false;
    }

    return this.wasActive;
  }
}

export const verticalHandDetector = new VerticalHandDetector();
