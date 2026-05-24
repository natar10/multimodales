import * as THREE from 'three';

export const useStats = false;
export const isMobile = /(iPad|iPhone|Android)/i.test(navigator.userAgent);

// 16k particles for better performance
export const simulatorTextureWidth = 128;
export const simulatorTextureHeight = 128;

export const useTriangleParticles = false;
export const followMouse = true;

export const speed = 0.3;
export const dieSpeed = 0.015;
export const radius = 0.14;
export const curlSize = 0.02;
export const attraction = 2.0;
export const particleSize = 10.0;
export const shadowDarkness = 0.45;

export const bgColor = '#000000';
export const color1 = '#e3a650';
export const color2 = '#ffff00';

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
    amount: '16k',
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
