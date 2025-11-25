'use client'

import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'

// Sonidos disponibles (puedes agregar más archivos de audio más adelante)
const soundFiles = {
  // UI Sounds
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  
  // Game Sounds
  gameStart: '/sounds/game-start.mp3',
  gameClear: '/sounds/game-clear.mp3',
  gameOver: '/sounds/game-over.mp3',
  death: '/sounds/death.mp3',
  elimination: '/sounds/elimination.mp3',
  
  // Action Sounds
  vote: '/sounds/vote.mp3',
  reveal: '/sounds/reveal.mp3',
  countdown: '/sounds/countdown.mp3',
  tick: '/sounds/tick.mp3',
  
  // Ambient
  heartbeat: '/sounds/heartbeat.mp3',
  tension: '/sounds/tension.mp3',
  
  // Background Music
  bgmIntro: '/sounds/bgm-intro.mp3',
  bgmGame: '/sounds/bgm-game.mp3',
}

type SoundKey = keyof typeof soundFiles

interface UseSoundOptions {
  volume?: number
  loop?: boolean
  autoplay?: boolean
}

export function useSound() {
  const [enabled, setEnabled] = useState(true)
  const [volume, setVolume] = useState(0.7)
  const soundsRef = useRef<Map<string, Howl>>(new Map())
  const bgMusicRef = useRef<Howl | null>(null)

  // Initialize sounds
  useEffect(() => {
    Object.entries(soundFiles).forEach(([key, src]) => {
      // For now, we'll create placeholder sounds that can be replaced with actual files
      // In production, replace these with actual audio files
      try {
        const howl = new Howl({
          src: [src],
          volume: key.includes('bgm') ? volume * 0.3 : volume,
          loop: key.includes('bgm') || key === 'heartbeat' || key === 'tension',
          preload: false, // Lazy load sounds
          onloaderror: (id, error) => {
            // Silently fail if sound file doesn't exist (for now)
            console.warn(`Sound file not found: ${src}`, error)
          },
        })
        soundsRef.current.set(key, howl)
      } catch (error) {
        console.warn(`Could not load sound: ${key}`, error)
      }
    })

    return () => {
      // Cleanup
      soundsRef.current.forEach((howl) => {
        howl.unload()
      })
      if (bgMusicRef.current) {
        bgMusicRef.current.unload()
      }
    }
  }, [])

  const play = (soundKey: SoundKey, options?: UseSoundOptions) => {
    if (!enabled) return

    const sound = soundsRef.current.get(soundKey)
    if (!sound) {
      // Create a simple beep sound as fallback
      playFallbackSound(soundKey, options)
      return
    }

    const playId = sound.play()
    
    if (options?.volume !== undefined) {
      sound.volume(options.volume, playId)
    }

    return playId
  }

  const stop = (soundKey: SoundKey) => {
    const sound = soundsRef.current.get(soundKey)
    if (sound) {
      sound.stop()
    }
    if (bgMusicRef.current) {
      bgMusicRef.current.stop()
    }
  }

  const setSoundVolume = (newVolume: number) => {
    setVolume(newVolume)
    soundsRef.current.forEach((howl) => {
      if (!howl.loop()) {
        // Only update volume for non-looping sounds
        howl.volume(newVolume)
      }
    })
  }

  const setBgMusicVolume = (newVolume: number) => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume(newVolume * 0.3) // Background music is quieter
    }
  }

  const playBgMusic = (soundKey: 'bgmIntro' | 'bgmGame' = 'bgmGame') => {
    stopBgMusic()
    const sound = soundsRef.current.get(soundKey)
    if (sound && enabled) {
      bgMusicRef.current = sound
      sound.play()
    }
  }

  const stopBgMusic = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.stop()
      bgMusicRef.current = null
    }
  }

  // Fallback: Generate simple sounds using Web Audio API
  const playFallbackSound = (soundKey: SoundKey, options?: UseSoundOptions) => {
    if (!enabled) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different sounds
    const frequencies: Record<string, number> = {
      click: 800,
      success: 600,
      error: 300,
      gameStart: 400,
      gameClear: 500,
      gameOver: 200,
      death: 150,
      elimination: 250,
      vote: 700,
      reveal: 600,
      countdown: 500,
      tick: 1000,
      heartbeat: 60,
      tension: 100,
    }

    const frequency = frequencies[soundKey] || 440
    oscillator.frequency.value = frequency
    oscillator.type = soundKey === 'death' || soundKey === 'gameOver' ? 'sawtooth' : 'sine'

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(options?.volume || volume * 0.3, audioContext.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  return {
    enabled,
    volume,
    play,
    stop,
    setEnabled,
    setSoundVolume,
    setBgMusicVolume,
    playBgMusic,
    stopBgMusic,
  }
}

