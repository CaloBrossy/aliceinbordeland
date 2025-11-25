'use client'

import { useEffect, useState } from 'react'
import { getSoundManager } from '@/lib/sounds'

export function useSounds() {
  const [soundManager] = useState(() => getSoundManager())
  const [enabled, setEnabled] = useState(() => soundManager.isEnabled())

  useEffect(() => {
    setEnabled(soundManager.isEnabled())
  }, [])

  const playSound = (soundName: string, volume?: number) => {
    if (enabled) {
      soundManager.play(soundName, volume)
    }
  }

  const stopSound = (soundName: string, soundId?: number) => {
    soundManager.stop(soundName, soundId)
  }

  const toggleSounds = (enabled: boolean) => {
    soundManager.setEnabled(enabled)
    setEnabled(enabled)
  }

  const setVolume = (volume: number) => {
    soundManager.setVolume(volume)
  }

  return {
    playSound,
    stopSound,
    toggleSounds,
    setVolume,
    enabled,
    volume: soundManager.getVolume(),
  }
}

