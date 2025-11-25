'use client'

import { useEffect, useRef } from 'react'

interface ParticleBackgroundProps {
  particleCount?: number
  speed?: number
  color?: string
  opacity?: number
}

export default function ParticleBackground({
  particleCount = 50,
  speed = 0.5,
  color = '#ffffff',
  opacity = 0.3,
}: ParticleBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const particles: Array<{
      element: HTMLDivElement
      x: number
      y: number
      vx: number
      vy: number
      size: number
    }> = []

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.backgroundColor = color
      particle.style.opacity = `${opacity}`
      particle.style.width = `${Math.random() * 3 + 1}px`
      particle.style.height = particle.style.width
      particle.style.position = 'absolute'
      particle.style.borderRadius = '50%'
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.willChange = 'transform'

      containerRef.current.appendChild(particle)

      particles.push({
        element: particle,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 3 + 1,
      })
    }

    // Animate particles
    let animationFrame: number
    const animate = () => {
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x > window.innerWidth) particle.x = 0
        if (particle.x < 0) particle.x = window.innerWidth
        if (particle.y > window.innerHeight) particle.y = 0
        if (particle.y < 0) particle.y = window.innerHeight

        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      particles.forEach((particle) => {
        if (particle.x > window.innerWidth) particle.x = window.innerWidth
        if (particle.y > window.innerHeight) particle.y = window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
      particles.forEach((particle) => {
        particle.element.remove()
      })
    }
  }, [particleCount, speed, color, opacity])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        overflow: 'hidden',
      }}
    />
  )
}

