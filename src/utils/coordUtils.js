// Dimensiones del plano de vídeo en world units.
// Se actualizan desde SceneManager cada vez que el plano cambia de tamaño.
export const planeDimensions = {
  width: 16,
  height: 9,
  z: -10,
}

// Aliases de solo lectura para compatibilidad con código existente
export const PLANE_Z = -10

/** @deprecated Usa planeDimensions.width — este valor ya no es fijo */
export const PLANE_WIDTH = 16
/** @deprecated Usa planeDimensions.height — este valor ya no es fijo */
export const PLANE_HEIGHT = 9

/**
 * Convierte coordenadas normalizadas de MediaPipe (0-1) a world coords de Three.js.
 * Usa las dimensiones actuales del plano de vídeo.
 * El plano tiene rotation.y = Math.PI, por eso X se invierte.
 */
export function normalizedToWorld(nx, ny, offsetZ = 0.5) {
  return {
    x: (0.5 - nx) * planeDimensions.width,
    y: (0.5 - ny) * planeDimensions.height,
    z: planeDimensions.z + offsetZ,
  }
}

/**
 * Devuelve el punto central entre dos keypoints normalizados.
 */
export function keypointCenter(kp1, kp2) {
  return {
    x: (kp1.x + kp2.x) / 2,
    y: (kp1.y + kp2.y) / 2,
  }
}
