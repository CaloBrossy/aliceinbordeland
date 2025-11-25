import { Howl } from 'howler'

// Sound effects configuration
// Note: In production, replace these with actual sound file URLs
// For now, we'll use Web Audio API to generate sounds on the fly

export class SoundManager {
  private sounds: Map<string, Howl> = new Map()
  private enabled: boolean = true
  private masterVolume: number = 0.7

  constructor() {
    if (typeof window !== 'undefined') {
      // Check if user prefers reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        this.enabled = false
      }

      // Load user preference from localStorage
      const soundEnabled = localStorage.getItem('soundEnabled')
      if (soundEnabled !== null) {
        this.enabled = soundEnabled === 'true'
      }

      // Initialize sounds
      this.initSounds()
    }
  }

  private initSounds() {
    // Generate sounds using Web Audio API and convert to Howl
    // Note: In production, use actual sound files for better quality

    // Death/Elimination sound (low, dark tone)
    this.sounds.set(
      'death',
      this.createToneSound(200, 0.5, 'sawtooth', 0.6, 0.8)
    )

    // Game Clear sound (high, pleasant tone)
    this.sounds.set(
      'gameClear',
      this.createToneSound(523, 0.8, 'sine', 0.7, 1.0)
    )

    // Game Over sound (low, ominous tone)
    this.sounds.set(
      'gameOver',
      this.createToneSound(150, 0.8, 'square', 0.7, 0.7)
    )

    // Reveal sound (medium, suspenseful tone)
    this.sounds.set(
      'reveal',
      this.createToneSound(330, 0.4, 'sine', 0.6, 1.0)
    )

    // Countdown sound (short, sharp tone)
    this.sounds.set(
      'countdown',
      this.createToneSound(523, 0.2, 'sine', 0.5, 1.0)
    )

    // Timer warning sound (urgent, repeating)
    this.sounds.set(
      'timerWarning',
      this.createToneSound(440, 0.15, 'square', 0.5, 1.5)
    )

    // Click/Vote sound (short, click-like)
    this.sounds.set(
      'click',
      this.createToneSound(800, 0.05, 'sine', 0.4, 2.0)
    )

    // Card flip sound (swoosh-like)
    this.sounds.set(
      'cardFlip',
      this.createToneSound(400, 0.3, 'sine', 0.5, 1.0)
    )

    // Success sound (pleasant, upward tone)
    this.sounds.set(
      'success',
      this.createToneSound(523, 0.3, 'sine', 0.6, 1.0)
    )

    // Error sound (low, warning tone)
    this.sounds.set(
      'error',
      this.createToneSound(200, 0.3, 'square', 0.5, 0.5)
    )
  }

  // Create a tone sound using Web Audio API
  private createToneSound(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.5,
    rate: number = 1.0
  ): Howl {
    if (typeof window === 'undefined') {
      // Return a mock Howl for SSR
      return {
        play: () => 0,
        stop: () => {},
        volume: () => {},
      } as any
    }

    try {
      // Generate audio data URL using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const sampleRate = audioContext.sampleRate
      const numSamples = Math.floor(sampleRate * duration)
      const buffer = audioContext.createBuffer(1, numSamples, sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        let value = 0

        if (type === 'sine') {
          value = Math.sin(2 * Math.PI * frequency * t)
        } else if (type === 'square') {
          value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1
        } else if (type === 'sawtooth') {
          value = 2 * ((t * frequency) % 1) - 1
        }

        // Apply envelope (fade out)
        const envelope = Math.max(0, 1 - t / duration)
        data[i] = value * volume * envelope
      }

      // Convert to WAV format
      const wav = this.bufferToWav(buffer)
      const blob = new Blob([wav], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)

      return new Howl({
        src: [url],
        volume: volume * this.masterVolume,
        rate,
      })
    } catch (e) {
      console.warn('Could not create tone sound:', e)
      // Return a silent Howl as fallback
      return {
        play: () => 0,
        stop: () => {},
        volume: () => {},
      } as any
    }
  }

  // Convert AudioBuffer to WAV format
  private bufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16
    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample

    const length = buffer.length * numChannels * bytesPerSample
    const arrayBuffer = new ArrayBuffer(44 + length)
    const view = new DataView(arrayBuffer)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, length, true)

    // Convert float samples to 16-bit PCM
    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
        offset += 2
      }
    }

    return arrayBuffer
  }

  play(soundName: string, volume?: number) {
    if (!this.enabled) return

    const sound = this.sounds.get(soundName)
    if (sound) {
      const soundId = sound.play()
      if (volume !== undefined) {
        sound.volume(volume * this.masterVolume, soundId)
      }
      return soundId
    }
  }

  stop(soundName: string, soundId?: number) {
    const sound = this.sounds.get(soundName)
    if (sound) {
      if (soundId !== undefined) {
        sound.stop(soundId)
      } else {
        sound.stop()
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', enabled.toString())
    }
  }

  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach((sound) => {
      sound.volume(this.masterVolume)
    })
  }

  isEnabled() {
    return this.enabled
  }

  getVolume() {
    return this.masterVolume
  }
}

// Singleton instance
let soundManagerInstance: SoundManager | null = null

export function getSoundManager(): SoundManager {
  if (typeof window === 'undefined') {
    // Return a mock sound manager for SSR
    return {
      play: () => undefined,
      stop: () => {},
      setEnabled: () => {},
      setVolume: () => {},
      isEnabled: () => false,
      getVolume: () => 0,
    } as any
  }

  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager()
  }
  return soundManagerInstance
}

