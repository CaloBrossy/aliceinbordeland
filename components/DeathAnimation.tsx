'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Skull } from 'lucide-react'
import { useSoundContext } from './SoundProvider'

interface DeathAnimationProps {
  playerName: string
  onComplete: () => void
}

export default function DeathAnimation({ playerName, onComplete }: DeathAnimationProps) {
  const [show, setShow] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const skullRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)
  const sound = useSoundContext()

  useEffect(() => {
    if (!containerRef.current) return

    // Screen shake
    gsap.to('body', {
      x: -10,
      y: -10,
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      ease: 'power2.inOut',
    })

    // Flash red
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0.9,
        duration: 0.1,
        ease: 'power2.out',
      })
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        delay: 0.1,
        ease: 'power2.in',
      })
    }

    // Play death sequence sound
    sound.playDeathSequence(() => {
      // Continue with animation
    })

    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => {
          setShow(false)
          onComplete()
        }, 1000)
      },
    })

    // Card slow motion + rotation
    if (cardRef.current) {
      tl.to(
        cardRef.current,
        {
          scale: 1.2,
          rotation: 15,
          duration: 0.3,
          ease: 'power2.out',
        },
        0
      )
        .to(
          cardRef.current,
          {
            scale: 0.8,
            rotation: -15,
            duration: 0.2,
            ease: 'power2.in',
          },
          0.3
        )
        .to(
          cardRef.current,
          {
            scale: 0,
            rotation: 180,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.in',
          },
          0.5
        )
    }

    // Chromatic aberration effect
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        filter: 'blur(2px)',
        duration: 0.1,
        yoyo: true,
        repeat: 3,
      })
    }

    // Create explosion particles
    createExplosionParticles()

    // ELIMINADO text appears
    if (textRef.current) {
      tl.fromTo(
        textRef.current,
        {
          scale: 0,
          opacity: 0,
          rotation: -180,
        },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.6,
          ease: 'back.out(2)',
        },
        0.2
      )
        .to(
          textRef.current,
          {
            scale: 1.1,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
          },
          0.8
        )
    }

    // Skull rotation
    if (skullRef.current) {
      tl.to(
        skullRef.current,
        {
          rotation: 360,
          scale: 1.5,
          duration: 1,
          ease: 'power2.out',
        },
        0.2
      )
    }

    // Scan lines
    const scanLines = document.createElement('div')
    scanLines.className = 'absolute inset-0 pointer-events-none'
    scanLines.style.background = `repeating-linear-gradient(
      0deg,
      rgba(255, 0, 0, 0.1) 0px,
      rgba(255, 0, 0, 0.1) 2px,
      transparent 2px,
      transparent 4px
    )`
    scanLines.style.animation = 'scanlines 0.1s linear infinite'
    if (overlayRef.current) {
      overlayRef.current.appendChild(scanLines)
    }

    // Fade out
    tl.to(
      containerRef.current,
      {
        opacity: 0,
        duration: 1,
        ease: 'power2.in',
      },
      1.5
    )

    return () => {
      scanLines.remove()
    }
  }, [])

  const createExplosionParticles = () => {
    if (!particlesRef.current) return

    const particleCount = 50
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    // Layer 1: Fire particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'absolute w-3 h-3 rounded-full'
      particle.style.background = `radial-gradient(circle, #ff6b00, #ff0033)`
      particle.style.boxShadow = '0 0 20px rgba(255, 0, 51, 0.8)'
      particle.style.left = `${centerX}px`
      particle.style.top = `${centerY}px`
      particle.style.willChange = 'transform'
      particlesRef.current.appendChild(particle)

      const angle = (360 / particleCount) * i
      const distance = 200 + Math.random() * 100
      const duration = 1 + Math.random() * 0.5

      gsap.to(particle, {
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
        opacity: 0,
        scale: 0,
        duration,
        ease: 'power2.out',
        onComplete: () => particle.remove(),
      })
    }

    // Layer 2: Lightning/explosion
    for (let i = 0; i < 10; i++) {
      const lightning = document.createElement('div')
      lightning.className = 'absolute'
      lightning.style.width = '4px'
      lightning.style.height = `${50 + Math.random() * 100}px`
      lightning.style.background = 'linear-gradient(to bottom, #00d9ff, transparent)'
      lightning.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.8)'
      lightning.style.left = `${centerX + (Math.random() - 0.5) * 200}px`
      lightning.style.top = `${centerY}px`
      lightning.style.transformOrigin = 'center top'
      lightning.style.willChange = 'transform, opacity'
      particlesRef.current.appendChild(lightning)

      gsap.to(lightning, {
        rotation: (Math.random() - 0.5) * 60,
        opacity: 0,
        scaleY: 0,
        duration: 0.3,
        delay: Math.random() * 0.2,
        ease: 'power2.out',
        onComplete: () => lightning.remove(),
      })
    }

    // Layer 3: Smoke
    for (let i = 0; i < 20; i++) {
      const smoke = document.createElement('div')
      smoke.className = 'absolute w-8 h-8 rounded-full'
      smoke.style.background = 'radial-gradient(circle, rgba(100, 100, 100, 0.6), transparent)'
      smoke.style.left = `${centerX + (Math.random() - 0.5) * 100}px`
      smoke.style.top = `${centerY + (Math.random() - 0.5) * 100}px`
      smoke.style.willChange = 'transform, opacity'
      particlesRef.current.appendChild(smoke)

      const angle = (360 / 20) * i
      const distance = 150 + Math.random() * 50

      gsap.to(smoke, {
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance - 50,
        opacity: 0,
        scale: 2,
        duration: 2,
        ease: 'power2.out',
        onComplete: () => smoke.remove(),
      })
    }
  }

  if (!show) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ opacity: 1 }}
    >
      {/* Red flash overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-red-600"
        style={{ opacity: 0 }}
      />

      {/* Explosion particles */}
      <div ref={particlesRef} className="absolute inset-0" />

      {/* Card being eliminated (if provided) */}
      <div
        ref={cardRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* ELIMINADO overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          ref={textRef}
          className="text-center"
          style={{
            transform: 'scale(0)',
            opacity: 0,
          }}
        >
          <h1
            className="text-9xl font-bold text-red-500 mb-4"
            style={{
              textShadow: '0 0 60px rgba(233, 69, 96, 1), 0 0 120px rgba(233, 69, 96, 0.6)',
              filter: 'drop-shadow(0 0 40px rgba(233, 69, 96, 1))',
              fontFamily: 'monospace',
            }}
          >
            ELIMINADO
          </h1>
          <p
            className="text-4xl text-white font-bold"
            style={{
              textShadow: '0 0 30px rgba(255, 255, 255, 0.8)',
            }}
          >
            {playerName}
          </p>
        </div>

        {/* Rotating skull */}
        <div
          ref={skullRef}
          className="mt-8"
          style={{
            transform: 'scale(0)',
          }}
        >
          <Skull className="w-32 h-32 text-red-500" style={{ filter: 'drop-shadow(0 0 30px rgba(233, 69, 96, 0.8))' }} />
        </div>

        {/* Borders */}
        <div
          className="absolute inset-0 border-8 border-red-600"
          style={{
            boxShadow: 'inset 0 0 100px rgba(233, 69, 96, 0.5)',
            animation: 'flash 0.2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}

