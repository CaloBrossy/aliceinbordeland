'use client'

import { useRef, useEffect } from 'react'
import { Users, Skull } from 'lucide-react'
import { gsap } from 'gsap'
import type { Player } from '@/types/game'

interface PlayerCardProps {
  player: Player
  isCurrentUser?: boolean
  onDeathAnimation?: () => void
}

export default function PlayerCard({ player, isCurrentUser = false, onDeathAnimation }: PlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const smokeParticlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return

    // 3D hover effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * 10
      const rotateY = ((centerX - x) / centerX) * 10

      gsap.to(cardRef.current, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      })
    }

    const handleMouseLeave = () => {
      if (!cardRef.current) return
      gsap.to(cardRef.current, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.5,
        ease: 'power2.out',
      })
    }

    if (player.alive) {
      cardRef.current.addEventListener('mousemove', handleMouseMove)
      cardRef.current.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('mousemove', handleMouseMove)
        cardRef.current.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [player.alive])

  // Animate avatar gradient
  useEffect(() => {
    if (!avatarRef.current || !player.alive) return

    const gradient = gsap.to(avatarRef.current, {
      backgroundPosition: '200% 200%',
      duration: 3,
      repeat: -1,
      ease: 'none',
    })

    return () => {
      gradient.kill()
    }
  }, [player.alive])

  // Smoke particles for dead players
  useEffect(() => {
    if (player.alive || !smokeParticlesRef.current) return

    const createSmoke = () => {
      const smoke = document.createElement('div')
      smoke.className = 'absolute w-4 h-4 rounded-full'
      smoke.style.background = 'radial-gradient(circle, rgba(100, 100, 100, 0.4), transparent)'
      smoke.style.left = `${Math.random() * 100}%`
      smoke.style.top = `${Math.random() * 100}%`
      smoke.style.willChange = 'transform, opacity'
      smokeParticlesRef.current?.appendChild(smoke)

      gsap.to(smoke, {
        y: -50,
        x: (Math.random() - 0.5) * 50,
        opacity: 0,
        scale: 2,
        duration: 3 + Math.random() * 2,
        ease: 'power2.out',
        onComplete: () => smoke.remove(),
      })
    }

    const interval = setInterval(createSmoke, 1000)
    createSmoke()

    return () => clearInterval(interval)
  }, [player.alive])

  return (
    <div
      ref={cardRef}
      className={`card-3d relative overflow-hidden rounded-lg transition-all duration-300 ${
        player.alive
          ? 'glass-strong border-2 hover:neon-shadow-green'
          : 'opacity-30 grayscale border-2 border-gray-800'
      }`}
      style={{
        borderColor: player.alive
          ? 'rgba(78, 204, 163, 0.5)'
          : 'rgba(100, 100, 100, 0.3)',
        boxShadow: player.alive
          ? '0 0 20px rgba(78, 204, 163, 0.3), inset 0 0 20px rgba(78, 204, 163, 0.1)'
          : 'none',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Smoke particles for dead players */}
      {!player.alive && (
        <div ref={smokeParticlesRef} className="absolute inset-0 pointer-events-none" />
      )}

      {/* ELIMINATED stamp for dead players */}
      {!player.alive && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{
            transform: 'rotate(-45deg)',
          }}
        >
          <div
            className="px-8 py-2 border-4 border-red-600 bg-red-900/80"
            style={{
              boxShadow: '0 0 30px rgba(233, 69, 96, 0.8)',
            }}
          >
            <span className="text-red-500 font-bold text-2xl">ELIMINATED</span>
          </div>
        </div>
      )}

      {/* Pulsing border for alive players */}
      {player.alive && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            border: '2px solid rgba(78, 204, 163, 0.8)',
            boxShadow: '0 0 20px rgba(78, 204, 163, 0.6)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        />
      )}

      <div className="p-6 relative z-0">
        {/* Avatar with animated gradient */}
        <div className="flex items-center gap-4 mb-4">
          <div
            ref={avatarRef}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white relative overflow-hidden"
            style={{
              background: player.alive
                ? 'linear-gradient(135deg, #4ecca3, #00d9ff, #4ecca3)'
                : 'linear-gradient(135deg, #4a4a4a, #2a2a2a)',
              backgroundSize: '200% 200%',
              backgroundPosition: '0% 0%',
              boxShadow: player.alive
                ? '0 0 20px rgba(78, 204, 163, 0.6), inset 0 0 20px rgba(0, 217, 255, 0.3)'
                : 'none',
            }}
          >
            {player.alive ? (
              <Users className="w-8 h-8" />
            ) : (
              <Skull className="w-8 h-8 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h3
              className={`text-xl font-bold ${
                player.alive ? 'text-white' : 'text-gray-500 line-through'
              }`}
            >
              {player.name}
              {isCurrentUser && (
                <span className="ml-2 text-sm text-cyan-400">(Tú)</span>
              )}
            </h3>
            <p className="text-sm text-gray-400">
              {player.cards} {player.cards === 1 ? 'carta' : 'cartas'}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {player.alive ? (
            <>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" style={{ boxShadow: '0 0 10px rgba(78, 204, 163, 0.8)' }} />
              <span className="text-sm text-green-400 font-bold">VIVO</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-gray-600" />
              <span className="text-sm text-gray-500 font-bold">MUERTO</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

