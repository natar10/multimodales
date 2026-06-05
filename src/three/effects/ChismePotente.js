import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'

export class ChismePotente {
  constructor() {
    this.glitchPass = null
    this.composer = null
    this._audioCtx = null
    this._audioBuffer = null
    this.isActive = false
    this._timer = null
    this._wildTimer = null
  }

  init(scene, composer) {
    this.composer = composer

    this.glitchPass = new GlitchPass()
    this.glitchPass.enabled = false
    composer.addPass(this.glitchPass)

    // Pre-decode audio into a PCM buffer so playback is instant
    this._audioCtx = new AudioContext()
    fetch('/corneta.mp3')
      .then((r) => r.arrayBuffer())
      .then((buf) => this._audioCtx.decodeAudioData(buf))
      .then((decoded) => { this._audioBuffer = decoded })
      .catch((e) => console.warn('Audio preload error:', e))
  }

  _playAudio() {
    if (!this._audioBuffer || !this._audioCtx) return
    this._audioCtx.resume().then(() => {
      const src = this._audioCtx.createBufferSource()
      src.buffer = this._audioBuffer
      src.connect(this._audioCtx.destination)
      src.start()
    })
  }

  setActive(active) {
    if (active) {
      clearTimeout(this._timer)
      clearTimeout(this._wildTimer)

      this.isActive = true
      this.glitchPass.enabled = true
      this.glitchPass.goWild = true

      // After 1.5s: soften to subtle glitch
      this._wildTimer = setTimeout(() => {
        if (this.glitchPass) this.glitchPass.goWild = false
      }, 1500)

      this._playAudio()

      // Auto-stop after 4s
      this._timer = setTimeout(() => this.setActive(false), 4000)
    } else {
      this.isActive = false
      clearTimeout(this._timer)
      clearTimeout(this._wildTimer)
      if (this.glitchPass) {
        this.glitchPass.enabled = false
        this.glitchPass.goWild = false
      }
    }
  }

  update(_deltaTime, _faceLandmarks) {}

  dispose() {
    clearTimeout(this._timer)
    clearTimeout(this._wildTimer)
    if (this.composer && this.glitchPass) {
      const idx = this.composer.passes.indexOf(this.glitchPass)
      if (idx !== -1) this.composer.passes.splice(idx, 1)
    }
    this.glitchPass?.dispose()
    this._audioCtx?.close()
  }
}
