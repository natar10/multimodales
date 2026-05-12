import * as THREE from 'three';

export const useStats = false;
export const isMobile = /(iPad|iPhone|Android)/i.test(navigator.userAgent);

// Hardcode 65k particles for decent performance/looks
export const simulatorTextureWidth = 256;
export const simulatorTextureHeight = 256;

export const useTriangleParticles = true;
export const followMouse = true;

export const speed = 1;
export const dieSpeed = 0.015;
export const radius = 0.6; // derived from 65k amount mapping
export const curlSize = 0.02;
export const attraction = 1;
export const particleSize = 80.0; // Cambia este valor para ajustar el tamaño de cada chispa
export const shadowDarkness = 0.45;

export const bgColor = '#000000';
export const color1 = '#ff7b00'; // Dr. Strange portal orange!
export const color2 = '#ffb700'; // Dr. Strange portal yellow!

export const fxaa = false;
export const motionBlurQualityMap = {
    best: 1,
    high: 0.5,
    medium: 1 / 3,
    low: 0.25
};
export const motionBlurQuality = 'medium';
export const motionBlur = false; // We use standard effect composer later
export const motionBlurPause = false;
export const bloom = true;

export const query = {
    amount: '65k',
    motionBlurQuality: 'medium'
};

export const mouse = new THREE.Vector2(0, 0);
export const mouse3d = new THREE.Vector3(0, 0, 0);
export let camera = null;
export let cameraPosition = new THREE.Vector3(0, 0, 0);

export function setCamera(cam) {
    camera = cam;
    cameraPosition = cam.position;
}
