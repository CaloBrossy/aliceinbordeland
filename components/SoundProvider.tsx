'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSound } from '@/hooks/useSound'

interface SoundContextType {
  enabled: boolean
  volume: number
  volumes: {
    introMusic: number
    ambientMusic: number
    uiSounds: number
    dramaticEffects: number
  }
  play: (
    soundKey: string,
    options?: {
      volume?: number
      loop?: boolean
      fadeIn?: number
      fadeOut?: number
    }
  ) => void | number
  stop: (soundKey: string) => void
  stopWithFade: (soundKey: string, fadeOut?: number) => void
  setEnabled: (enabled: boolean) => void
  setSoundVolume: (volume: number) => void
  setVolumeType: (type: 'introMusic' | 'ambientMusic' | 'uiSounds' | 'dramaticEffects', volume: number) => void
  setBgMusicVolume: (volume: number) => void
  playBgMusic: (soundKey?: 'introMusic' | 'ambientMusic', fadeIn?: number) => void
  stopBgMusic: (fadeOut?: number) => void
  playDeathSequence: (onComplete?: () => void) => void
  playHeartbeat: (rate?: number) => void
  accelerateHeartbeat: (finalRate?: number, duration?: number) => void
  stopHeartbeat: (fadeOut?: number) => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSound()

  return <SoundContext.Provider value={sound}>{children}</SoundContext.Provider>
}

export function useSoundContext() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error('useSoundContext must be used within a SoundProvider')
  }
  return context
}

