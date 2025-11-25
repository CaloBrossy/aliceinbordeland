'use client'

import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'

// Sonidos disponibles - Archivos locales en public/sounds
const soundFiles = {
  // INTRO
  cardReveal: '/sounds/cardReveal.mp3', // Metallic whoosh
  textType: '/sounds/textType.mp3', // Tick suave
  ruleReveal: '/sounds/ruleReveal.mp3', // Ding
  countdown: '/sounds/countdown.mp3', // Beep
  gameStart: '/sounds/gameStart.mp3', // Explosión épica
  introMusic: '/sounds/introMusic.mp3', // Música tensa intro

  // JUEGO
  ambientMusic: '/sounds/ambientMusic.mp3', // Música ambiente loop
  hover: '/sounds/hover.mp3', // UI hover
  click: '/sounds/click.mp3', // UI click

  // TIMER ALERT (cuando quedan pocos segundos)
  alert: '/sounds/alert.mp3', // Alarma cuando quedan pocos segundos

  // MUERTE
  explosion: '/sounds/explosion.mp3', // Explosión
  eliminated: '/sounds/eliminated.mp3', // Gong dramático
  fadeOut: '/sounds/fadeOut.mp3', // Sonido apagándose

  // OTROS
  heartbeat: '/sounds/heartbeat.mp3', // Latidos

  // Sonidos legacy (para compatibilidad - usar sonidos existentes o fallback)
  revive: '/sounds/ruleReveal.mp3', // Mágico celestial (usar ruleReveal como fallback)
  reset: '/sounds/cardReveal.mp3', // Whoosh reinicio (usar cardReveal como fallback)
  victory: '/sounds/introMusic.mp3', // Música victoria (usar introMusic como fallback)
  defeat: '/sounds/ambientMusic.mp3', // Música derrota (usar ambientMusic como fallback)
  success: '/sounds/ruleReveal.mp3', // Sonido de éxito
  error: '/sounds/alert.mp3', // Sonido de error (usar alert como fallback)
  gameClear: '/sounds/ruleReveal.mp3', // Sonido de juego completado
  gameOver: '/sounds/eliminated.mp3', // Sonido de juego terminado
  death: '/sounds/eliminated.mp3', // Sonido de muerte
  elimination: '/sounds/eliminated.mp3', // Sonido de eliminación
  vote: '/sounds/click.mp3', // Sonido de voto (usar click como fallback)
  reveal: '/sounds/cardReveal.mp3', // Sonido de revelación
  tick: '/sounds/textType.mp3', // Sonido de tick/timer (usar textType como fallback)
  tension: '/sounds/ambientMusic.mp3', // Sonido de tensión (usar ambientMusic como fallback)
}

type SoundKey = keyof typeof soundFiles

// Tipos de volumen
export type VolumeType = 'introMusic' | 'ambientMusic' | 'uiSounds' | 'dramaticEffects'

interface UseSoundOptions {
  volume?: number
  loop?: boolean
  autoplay?: boolean
  fadeIn?: number // Duración del fade in en ms
  fadeOut?: number // Duración del fade out en ms
}

export function useSound() {
  const [enabled, setEnabled] = useState(true)
  const [volume, setVolume] = useState(0.7)
  
  // Volúmenes por tipo
  const [volumes, setVolumes] = useState({
    introMusic: 0.4,
    ambientMusic: 0.25,
    uiSounds: 0.3,
    dramaticEffects: 0.7,
  })

  const soundsRef = useRef<Map<string, Howl>>(new Map())
  const bgMusicRef = useRef<Howl | null>(null)
  const heartbeatRef = useRef<Howl | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentHeartbeatRate = useRef<number>(1.0)

  // Initialize sounds
  useEffect(() => {
    Object.entries(soundFiles).forEach(([key, src]) => {
      try {
        const isMusic = key === 'introMusic' || key === 'ambientMusic' || key === 'victory' || key === 'defeat'
        const isLoop = isMusic || key === 'heartbeat' || key === 'tension'
        
        const howl = new Howl({
          src: [src],
          volume: getSoundVolume(key as SoundKey),
          loop: isLoop,
          preload: 'auto', // Preload para carga rápida
          onloaderror: (id, error) => {
            console.warn(`Sound file not found: ${src}`, error)
            // Usar sonido fallback
            createFallbackSound(key as SoundKey)
          },
          onplayerror: (id, error) => {
            console.warn(`Sound play error: ${key}`, error)
            // Intentar reproducir sonido fallback
            playFallbackSound(key as SoundKey, { volume: getSoundVolume(key as SoundKey) })
          },
        })
        soundsRef.current.set(key, howl)
      } catch (error) {
        console.warn(`Could not load sound: ${key}`, error)
        createFallbackSound(key as SoundKey)
      }
    })

    // Cargar preferencias de localStorage
    const savedEnabled = localStorage.getItem('soundEnabled')
    if (savedEnabled !== null) {
      setEnabled(savedEnabled === 'true')
    }

    const savedVolumes = localStorage.getItem('soundVolumes')
    if (savedVolumes) {
      try {
        setVolumes({ ...volumes, ...JSON.parse(savedVolumes) })
      } catch (e) {
        console.warn('Could not parse saved volumes', e)
      }
    }

    return () => {
      // Cleanup
      soundsRef.current.forEach((howl) => {
        howl.unload()
      })
      if (bgMusicRef.current) {
        bgMusicRef.current.unload()
      }
      if (heartbeatRef.current) {
        heartbeatRef.current.unload()
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [])

  // Función para obtener volumen según el tipo de sonido
  const getSoundVolume = (key: SoundKey): number => {
    if (key === 'introMusic') return volumes.introMusic
    if (key === 'ambientMusic') return volumes.ambientMusic
    if (key === 'hover' || key === 'click' || key === 'textType' || key === 'tick') return volumes.uiSounds
    if (
      key === 'alert' ||
      key === 'explosion' ||
      key === 'eliminated' ||
      key === 'gameStart' ||
      key === 'death' ||
      key === 'elimination' ||
      key === 'gameOver' ||
      key === 'gameClear'
    ) {
      return volumes.dramaticEffects
    }
    return volume
  }

  // Crear sonido fallback usando Web Audio API
  const createFallbackSound = (soundKey: SoundKey) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Frecuencias por tipo de sonido
      const frequencies: Record<string, number> = {
        click: 800,
        hover: 600,
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
        textType: 1200,
        ruleReveal: 600,
        cardReveal: 300,
        alert: 400,
        explosion: 200,
        eliminated: 150,
        heartbeat: 60,
        tension: 100,
      }

      const frequency = frequencies[soundKey] || 440
      oscillator.frequency.value = frequency

      // Tipo de onda según sonido
      if (soundKey === 'death' || soundKey === 'gameOver' || soundKey === 'eliminated') {
        oscillator.type = 'sawtooth'
      } else if (soundKey === 'alert' || soundKey === 'explosion') {
        oscillator.type = 'square'
      } else {
        oscillator.type = 'sine'
      }

      const duration = soundKey === 'cardReveal' || soundKey === 'fadeOut' ? 0.5 : 0.1

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(getSoundVolume(soundKey) * 0.3, audioContext.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)

      // Guardar como Howl para consistencia
      const fallbackHowl = new Howl({
        src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJ'],
        volume: getSoundVolume(soundKey),
        loop: soundKey === 'heartbeat' || soundKey === 'tension',
        preload: false,
      })
      soundsRef.current.set(soundKey, fallbackHowl)
    } catch (e) {
      console.warn(`Could not create fallback sound: ${soundKey}`, e)
    }
  }

  // Reproducir sonido fallback
  const playFallbackSound = (soundKey: SoundKey, options?: UseSoundOptions) => {
    if (!enabled) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const frequencies: Record<string, number> = {
        click: 800,
        hover: 600,
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
        textType: 1200,
        ruleReveal: 600,
        cardReveal: 300,
        alert: 400,
        explosion: 200,
        eliminated: 150,
      }

      const frequency = frequencies[soundKey] || 440
      oscillator.frequency.value = frequency
      oscillator.type = soundKey === 'death' || soundKey === 'gameOver' ? 'sawtooth' : 'sine'

      const vol = options?.volume !== undefined ? options.volume : getSoundVolume(soundKey) * 0.3
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(vol, audioContext.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      console.warn(`Could not play fallback sound: ${soundKey}`, e)
    }
  }

  // Reproducir sonido con fade in/out
  const play = (soundKey: SoundKey, options?: UseSoundOptions): number | void => {
    if (!enabled) return

    const sound = soundsRef.current.get(soundKey)
    if (!sound) {
      playFallbackSound(soundKey, options)
      return
    }

    const playId = sound.play()

    if (options?.volume !== undefined) {
      sound.volume(options.volume, playId)
    } else {
      sound.volume(getSoundVolume(soundKey), playId)
    }

    // Fade in
    if (options?.fadeIn && options.fadeIn > 0) {
      sound.fade(0, sound.volume(undefined, playId), options.fadeIn, playId)
    }

    // Fade out (necesita ser manejado manualmente)
    if (options?.fadeOut && options.fadeOut > 0) {
      const duration = sound.duration(playId) * 1000 // Convertir a ms
      setTimeout(() => {
        sound.fade(sound.volume(undefined, playId), 0, options.fadeOut!, playId)
        setTimeout(() => {
          sound.stop(playId)
        }, options.fadeOut)
      }, duration - options.fadeOut)
    }

    return playId
  }

  const stop = (soundKey: SoundKey) => {
    const sound = soundsRef.current.get(soundKey)
    if (sound) {
      sound.stop()
    }
  }

  // Detener sonido con fade out
  const stopWithFade = (soundKey: SoundKey, fadeOut: number = 500) => {
    const sound = soundsRef.current.get(soundKey)
    if (sound) {
      const currentVolume = sound.volume()
      sound.fade(currentVolume, 0, fadeOut)
      setTimeout(() => {
        sound.stop()
      }, fadeOut)
    }
  }

  const setSoundVolume = (newVolume: number) => {
    setVolume(newVolume)
    soundsRef.current.forEach((howl) => {
      if (!howl.loop()) {
        howl.volume(newVolume)
      }
    })
  }

  const setVolumeType = (type: VolumeType, newVolume: number) => {
    const newVolumes = { ...volumes, [type]: newVolume }
    setVolumes(newVolumes)
    localStorage.setItem('soundVolumes', JSON.stringify(newVolumes))

    // Actualizar sonidos en tiempo real si están reproduciéndose
    if (type === 'ambientMusic' && bgMusicRef.current) {
      bgMusicRef.current.volume(newVolume)
    }
    if (type === 'introMusic' && bgMusicRef.current) {
      bgMusicRef.current.volume(newVolume)
    }
  }

  const setBgMusicVolume = (newVolume: number) => {
    setVolumeType('ambientMusic', newVolume)
    if (bgMusicRef.current) {
      bgMusicRef.current.volume(newVolume)
    }
  }

  // Reproducir música de fondo con fade in
  const playBgMusic = (soundKey: 'introMusic' | 'ambientMusic' = 'ambientMusic', fadeIn: number = 1000) => {
    stopBgMusic()
    const sound = soundsRef.current.get(soundKey)
    if (sound && enabled) {
      bgMusicRef.current = sound
      const playId = sound.play()
      sound.volume(0, playId)
      sound.fade(0, getSoundVolume(soundKey), fadeIn, playId)
    }
  }

  // Detener música de fondo con fade out
  const stopBgMusic = (fadeOut: number = 1000) => {
    if (bgMusicRef.current) {
      const currentVolume = bgMusicRef.current.volume()
      bgMusicRef.current.fade(currentVolume, 0, fadeOut)
      setTimeout(() => {
        bgMusicRef.current?.stop()
        bgMusicRef.current = null
      }, fadeOut)
    }
  }

  // Reproducir secuencia de muerte completa
  // NOTA: alert NO se usa aquí, solo para timer bajo
  const playDeathSequence = (onComplete?: () => void) => {
    if (!enabled) {
      onComplete?.()
      return
    }

    // Explosión
    play('explosion', { volume: volumes.dramaticEffects })
    setTimeout(() => {
      // Gong dramático
      play('eliminated', { volume: volumes.dramaticEffects })
      setTimeout(() => {
        // Fade out
        play('fadeOut', { volume: volumes.dramaticEffects * 0.5, fadeOut: 500 })
        setTimeout(() => {
          onComplete?.()
        }, 600)
      }, 300)
    }, 200)
  }

  // Reproducir heartbeat cuando queda 1 jugador
  const playHeartbeat = (rate: number = 1.0) => {
    if (!enabled) return

    stopHeartbeat()
    currentHeartbeatRate.current = rate

    const sound = soundsRef.current.get('heartbeat')
    if (sound) {
      heartbeatRef.current = sound
      sound.rate(rate)
      const playId = sound.play()
      sound.volume(volumes.ambientMusic * 0.8, playId)
      sound.loop(true)
    }
  }

  // Acelerar heartbeat
  const accelerateHeartbeat = (finalRate: number = 2.0, duration: number = 5000) => {
    if (!heartbeatRef.current) return

    const startRate = currentHeartbeatRate.current
    const steps = 20
    const stepDuration = duration / steps
    const rateStep = (finalRate - startRate) / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const newRate = startRate + rateStep * currentStep
      currentHeartbeatRate.current = newRate
      heartbeatRef.current?.rate(newRate)

      if (currentStep >= steps) {
        clearInterval(interval)
      }
    }, stepDuration)

    heartbeatIntervalRef.current = interval as any
  }

  // Detener heartbeat
  const stopHeartbeat = (fadeOut: number = 1000) => {
    if (heartbeatRef.current) {
      const currentVolume = heartbeatRef.current.volume()
      heartbeatRef.current.fade(currentVolume, 0, fadeOut)
      setTimeout(() => {
        heartbeatRef.current?.stop()
        heartbeatRef.current = null
      }, fadeOut)
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
    currentHeartbeatRate.current = 1.0
  }

  // Guardar estado enabled
  const toggleEnabled = (enabled: boolean) => {
    setEnabled(enabled)
    localStorage.setItem('soundEnabled', enabled.toString())
    if (!enabled) {
      stopBgMusic(500)
      stopHeartbeat(500)
    }
  }

  return {
    enabled,
    volume,
    volumes,
    play,
    stop,
    stopWithFade,
    setEnabled: toggleEnabled,
    setSoundVolume,
    setVolumeType,
    setBgMusicVolume,
    playBgMusic,
    stopBgMusic,
    playDeathSequence,
    playHeartbeat,
    accelerateHeartbeat,
    stopHeartbeat,
  }
}
