'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSound } from '@/hooks/useSound'

interface SoundContextType {
  enabled: boolean
  volume: number
  play: (soundKey: string, options?: { volume?: number; loop?: boolean }) => void | number
  stop: (soundKey: string) => void
  setEnabled: (enabled: boolean) => void
  setSoundVolume: (volume: number) => void
  setBgMusicVolume: (volume: number) => void
  playBgMusic: (soundKey?: 'bgmIntro' | 'bgmGame') => void
  stopBgMusic: () => void
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

