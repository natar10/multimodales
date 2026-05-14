import * as THREE from 'three';
import { positionFrag, quadVert, throughFrag, particlesVert, particlesFrag } from './shaders.js';
import * as settings from './core/settings.js';

export class PortalFBO {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.textureWidth = settings.simulatorTextureWidth;
    this.textureHeight = settings.simulatorTextureHeight;
    this.amount = this.textureWidth * this.textureHeight;

    this.active = false;
    this.initAnimation = 0; // 0 to 1

    this.mouse3d = new THREE.Vector3(0, 0, 0);

    this.group = new THREE.Group();

    this._initFBO();
    this._initParticles();
  }

  _initFBO() {
    const gl = this.renderer.getContext();
    if (!gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS)) {
      console.warn('No support for vertex shader textures!');
    }
    
    // Check if HalfFloatType FBO is supported. HalfFloatType is widely supported and safer than FloatType.
    if (!this.renderer.extensions.get('OES_texture_half_float')) {
      console.warn('No OES_texture_half_float support!');
    }

    this.fboScene = new THREE.Scene();
    this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

    const rawShaderPrefix = `precision ${this.renderer.capabilities.precision} float;\n`;

    this.copyShader = new THREE.RawShaderMaterial({
      uniforms: {
        resolution: { value: new THREE.Vector2(this.textureWidth, this.textureHeight) },
        texture: { value: null }
      },
      vertexShader: rawShaderPrefix + quadVert,
      fragmentShader: rawShaderPrefix + throughFrag
    });

    this.positionShader = new THREE.RawShaderMaterial({
      uniforms: {
        resolution: { value: new THREE.Vector2(this.textureWidth, this.textureHeight) },
        texturePosition: { value: null },
        textureDefaultPosition: { value: null },
        mouse3d: { value: this.mouse3d },
        speed: { value: settings.speed },
        dieSpeed: { value: settings.dieSpeed },
        radius: { value: settings.radius },
        curlSize: { value: settings.curlSize },
        attraction: { value: settings.attraction },
        time: { value: 0 },
        initAnimation: { value: 0 }
      },
      vertexShader: rawShaderPrefix + quadVert,
      fragmentShader: rawShaderPrefix + positionFrag,
      blending: THREE.NoBlending,
      transparent: false,
      depthWrite: false,
      depthTest: false
    });

    this.quadMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.copyShader);
    this.quadMesh.frustumCulled = false;
    this.fboScene.add(this.quadMesh);

    const rtParams = {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType, // Use FloatType like the original
      depthWrite: false,
      depthBuffer: false,
      stencilBuffer: false
    };

    this.rtPosition1 = new THREE.WebGLRenderTarget(this.textureWidth, this.textureHeight, rtParams);
    this.rtPosition2 = this.rtPosition1.clone();

    this.defaultPositionTexture = this._createPositionTexture();

    // Init FBO with default positions
    console.log('🔧 PortalFBO: Initializing FBO with defaultPositionTexture');

    const wasAutoClear = this.renderer.autoClearColor;
    this.renderer.autoClearColor = false;

    this.quadMesh.material = this.copyShader;
    this.copyShader.uniforms.texture.value = this.defaultPositionTexture;

    console.log('🔧 PortalFBO: Copying defaultPositionTexture to rtPosition1...');
    this.renderer.setRenderTarget(this.rtPosition1);
    this.renderer.render(this.fboScene, this.fboCamera);
    console.log('✅ PortalFBO: Rendered to rtPosition1');

    console.log('🔧 PortalFBO: Copying defaultPositionTexture to rtPosition2...');
    this.renderer.setRenderTarget(this.rtPosition2);
    this.renderer.render(this.fboScene, this.fboCamera);
    console.log('✅ PortalFBO: Rendered to rtPosition2');

    this.renderer.setRenderTarget(null);
    this.renderer.autoClearColor = wasAutoClear;

    // Read back pixels to verify the copy worked
    const readBuffer = new Float32Array(4);
    this.renderer.readRenderTargetPixels(this.rtPosition1, 0, 0, 1, 1, readBuffer);
    console.log('🔍 rtPosition1 first pixel after copy:', readBuffer);
    // If all zeros → copy failed. If values like [-26, -24, -33, 0.99] → copy worked.

    console.log('🔧 PortalFBO: FBO initialized, rtPosition1 and rtPosition2 ready');
  }

  _createPositionTexture() {
    const positions = new Float32Array(this.amount * 4);
    for (let i = 0; i < this.amount; i++) {
      const i4 = i * 4;
      const r = (0.5 + Math.random() * 0.5) * 50;
      const phi = (Math.random() - 0.5) * Math.PI;
      const theta = Math.random() * Math.PI * 2;
      positions[i4 + 0] = r * Math.cos(theta) * Math.cos(phi);
      positions[i4 + 1] = r * Math.sin(phi);
      positions[i4 + 2] = r * Math.sin(theta) * Math.cos(phi);
      positions[i4 + 3] = Math.random(); // Life
    }

    const texture = new THREE.DataTexture(positions, this.textureWidth, this.textureHeight, THREE.RGBAFormat, THREE.FloatType);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.flipY = false;

    console.log('🔧 PortalFBO: Created defaultPositionTexture with', this.amount, 'particles, first value:', positions.slice(0, 4));

    return texture;
  }

  _initParticles() {
    const position = new Float32Array(this.amount * 3);
    for (let i = 0; i < this.amount; i++) {
      const i3 = i * 3;
      position[i3 + 0] = (i % this.textureWidth) / this.textureWidth;
      position[i3 + 1] = ~~(i / this.textureWidth) / this.textureHeight;
      position[i3 + 2] = 0;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));

    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.shadowmap,
        {
          texturePosition: { value: null },
          color1: { value: new THREE.Color(settings.color1) },
          color2: { value: new THREE.Color(settings.color2) },
          particleSize: { value: settings.particleSize }
        }
      ]),
      vertexShader: particlesVert,
      fragmentShader: particlesFrag,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.particleMesh = new THREE.Points(geometry, this.particleMaterial);
    this.particleMesh.frustumCulled = false;

    // Particles live in local space of the group, which is positioned at the hand
    // No need for scale - positions from GPGPU are already in world coords
    this.group.add(this.particleMesh);
  }

  setActive(active) {
    this.active = active;
  }

  update(dt, x, y) {
    // Map normalized x, y (0 to 1) to screen space roughly.
    // Hand tracking y goes 0 to 1 downwards, so invert y.
    // X goes 0 to 1 left to right.
    // ThreeJS world space varies. We'll map it relative to camera frustum.
    // X is flipped because the webcam feed is mirrored!

    const v = new THREE.Vector3( (0.4 - x) * 2, -(y - 0.5) * 2, 0.5 );
    v.unproject(this.camera);
    const dir = v.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    const targetPos = this.camera.position.clone().add(dir.multiplyScalar(distance * 0.9)); // A bit in front of the camera

    // Smoothly track hand (0.3 = snappier tracking)
    this.mouse3d.lerp(targetPos, 0.3);

    // Particle Ring always stays flat facing the camera
    this.group.quaternion.copy(this.camera.quaternion);
    this.group.position.copy(this.mouse3d);

    // Handle open/close animation
    if (this.active) {
      this.initAnimation = Math.min(this.initAnimation + dt * 1.5, 1);
    } else {
      this.initAnimation = Math.max(this.initAnimation - dt * 2.0, 0);
    }

    this.particleMesh.visible = this.initAnimation > 0;

    // ALWAYS update particle material uniforms, even if initAnimation is 0
    this.particleMaterial.uniforms.texturePosition.value = this.rtPosition1.texture;
    this.particleMaterial.uniforms.particleSize.value = settings.particleSize;

    if (this.initAnimation === 0) {
      return;
    }

    // Debug: log animation progress every 0.5 seconds
    if (Math.floor(this.positionShader.uniforms.time.value * 10) % 5 === 0) {
      const hasTex = this.particleMaterial.uniforms.texturePosition.value !== null;
      console.log('✨ PortalFBO - initAnimation:', this.initAnimation.toFixed(2),
        'active:', this.active, 'hasTexture:', hasTex,
        'particleCount:', this.amount, 'mouse3d:', this.mouse3d);
    }

    // GPGPU Update Loop
    // Swap RTs
    const tmp = this.rtPosition1;
    this.rtPosition1 = this.rtPosition2;
    this.rtPosition2 = tmp;

    // Scale speed by deltaTime ratio (matching original: dt was in ms, ratio = dt/16.6667)
    const deltaRatio = (dt * 1000) / 16.6667;

    this.quadMesh.material = this.positionShader;
    this.positionShader.uniforms.textureDefaultPosition.value = this.defaultPositionTexture;
    this.positionShader.uniforms.texturePosition.value = this.rtPosition2.texture;
    this.positionShader.uniforms.time.value += dt * 0.001;
    this.positionShader.uniforms.speed.value = settings.speed * deltaRatio;
    this.positionShader.uniforms.dieSpeed.value = settings.dieSpeed * deltaRatio;
    this.positionShader.uniforms.initAnimation.value = this.initAnimation;
    this.positionShader.uniforms.mouse3d.value.copy(this.mouse3d);
    
    // We must disable autoClear otherwise we wipe out scene contents
    const autoClearColor = this.renderer.autoClearColor;
    this.renderer.autoClearColor = false;

    // Save previous render target state
    const currentRenderTarget = this.renderer.getRenderTarget();

    this.renderer.setRenderTarget(this.rtPosition1);
    this.renderer.render(this.fboScene, this.fboCamera);

    // Restore render state
    this.renderer.setRenderTarget(currentRenderTarget);
    this.renderer.autoClearColor = autoClearColor;

    // Update rtPosition1 reference for next frame (done again here for clarity)
    this.particleMaterial.uniforms.texturePosition.value = this.rtPosition1.texture;
  }

  dispose() {
    this.rtPosition1.dispose();
    this.rtPosition2.dispose();
    this.defaultPositionTexture.dispose();
    this.copyShader.dispose();
    this.positionShader.dispose();
    this.particleMaterial.dispose();
    this.particleMesh.geometry.dispose();
    this.quadMesh.geometry.dispose();
  }
}
