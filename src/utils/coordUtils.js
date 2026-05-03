// Video plane dimensions must match VideoPlane.js PlaneGeometry(16, 9) at z=-10
export const PLANE_WIDTH = 16
export const PLANE_HEIGHT = 9
export const PLANE_Z = -10

/**
 * Converts MediaPipe normalized coords (0-1) to Three.js world coords.
 * The video plane has rotation.y = Math.PI so X is already mirrored.
 */
export function normalizedToWorld(nx, ny, offsetZ = 0.5) {
  return {
    x: (0.5 - nx) * PLANE_WIDTH,
    y: (0.5 - ny) * PLANE_HEIGHT,
    z: PLANE_Z + offsetZ,
  }
}

/**
 * Returns the center point between two normalized keypoints.
 */
export function keypointCenter(kp1, kp2) {
  return {
    x: (kp1.x + kp2.x) / 2,
    y: (kp1.y + kp2.y) / 2,
  }
}
