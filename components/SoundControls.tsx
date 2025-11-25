'use client'

import { useState, useEffect } from 'react'
import { useSoundContext } from './SoundProvider'
import { Volume2, VolumeX } from 'lucide-react'
import type { VolumeType } from '@/hooks/useSound'

export default function SoundControls() {
  const { enabled, setEnabled, volumes, setVolumeType } = useSoundContext()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col gap-2 items-end">
        {/* Main Mute/Unmute Button */}
        <button
          onClick={() => setEnabled(!enabled)}
          className="p-3 bg-black/80 hover:bg-black/90 border border-red-600/50 rounded-lg transition-colors group relative"
          title={enabled ? 'Silenciar sonido' : 'Activar sonido'}
        >
          {enabled ? (
            <Volume2 className="w-5 h-5 text-red-500 group-hover:text-red-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-gray-500 group-hover:text-gray-400" />
          )}
        </button>

        {/* Settings Panel (opcional, expandible) */}
        {showSettings && (
          <div className="glass rounded-lg p-4 border border-red-600/30 min-w-[200px]">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white mb-2">Controles de Audio</h3>
              
              {/* Volume Controls */}
              <div className="space-y-2">
                <VolumeSlider
                  label="Música Intro"
                  value={volumes.introMusic}
                  onChange={(v) => setVolumeType('introMusic', v)}
                />
                <VolumeSlider
                  label="Música Ambiente"
                  value={volumes.ambientMusic}
                  onChange={(v) => setVolumeType('ambientMusic', v)}
                />
                <VolumeSlider
                  label="Sonidos UI"
                  value={volumes.uiSounds}
                  onChange={(v) => setVolumeType('uiSounds', v)}
                />
                <VolumeSlider
                  label="Efectos Dramáticos"
                  value={volumes.dramaticEffects}
                  onChange={(v) => setVolumeType('dramaticEffects', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Toggle Settings Button (pequeño, opcional) */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
        >
          {showSettings ? 'Ocultar' : 'Ajustes'}
        </button>
      </div>
    </div>
  )
}

function VolumeSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-gray-500">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  )
}

