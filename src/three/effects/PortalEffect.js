import * as THREE from 'three';
import { PortalFBO } from './spirit/PortalFBO.js';

export class PortalEffect {
  constructor() {
    this.group = new THREE.Group();
    this.portalFBO = null;
    this.isActive = false;
  }

  init(scene, renderer, camera) {
    console.log('PortalEffect initialized');
    
    // PortalFBO requires renderer and camera for FBO setup and mapping
    this.portalFBO = new PortalFBO(renderer, scene, camera);
    this.group.add(this.portalFBO.group);

    // Test sphere to see if the group is correctly tracking the hand
    const geo = new THREE.SphereGeometry(0.5, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.testSphere = new THREE.Mesh(geo, mat);
    this.portalFBO.group.add(this.testSphere);
    
    scene.add(this.group);
  }

  setActive(active) {
    this.isActive = active;
    this.testSphere.visible = active;
    if (this.portalFBO) {
      this.portalFBO.setActive(active);
    }
  }

  update(delta, faceDetections, handDetections) {
    if (!this.portalFBO) return;

    // Detect the primary hand position if active
    let targetX = 0.5;
    let targetY = 0.5;
    
    if (handDetections && handDetections.length > 0) {
      const primaryHand = handDetections[0];
      const palm = primaryHand[9]; // Middle finger MCP (palm center)
      if (palm) {
        targetX = palm.x;
        targetY = palm.y;
      }
    }

    this.portalFBO.update(delta, targetX, targetY);
  }

  dispose() {
    if (this.portalFBO) {
      this.portalFBO.dispose();
    }
    // Clean up group
    while (this.group.children.length > 0) { 
      this.group.remove(this.group.children[0]); 
    }
  }
}
