'use client'

import { useEffect, useState, useRef } from 'react'
import { useGSAP } from '@/hooks/useGSAP'
import { useSoundContext } from '@/components/SoundProvider'
import { getSuitEmoji, getSuitName } from '@/data/gamesLibrary'
import type { Game } from '@/types/game'
import { X, Play } from 'lucide-react'
import { gsap } from 'gsap'

interface GameIntroProps {
  game: Game
  onStart: () => void
  onSkip: () => void
}

export default function GameIntro({ game, onStart, onSkip }: GameIntroProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [skippable, setSkippable] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [glitchActive, setGlitchActive] = useState(false)
  const sound = useSoundContext()
  
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardParticlesRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const titleTextRef = useRef<HTMLDivElement>(null)
  const difficultyRef = useRef<HTMLDivElement>(null)
  const difficultyBarsRef = useRef<HTMLDivElement[]>([])
  const situationRef = useRef<HTMLDivElement>(null)
  const rulesRef = useRef<HTMLDivElement>(null)
  const ruleItemsRef = useRef<(HTMLLIElement | null)[]>([])
  const conditionsRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const countdownRef = useRef<HTMLDivElement>(null)
  const countdownCircleRef = useRef<SVGCircleElement>(null)
  const startButtonRef = useRef<HTMLButtonElement>(null)
  const underlineRef = useRef<HTMLDivElement>(null)

  const suitEmoji = getSuitEmoji(game.suit)
  const suitName = getSuitName(game.suit)
  const fullTitle = `${game.card.split(' ')[0]} DE ${suitName.toUpperCase()}`

  // Play intro music
  useEffect(() => {
    sound.playBgMusic('introMusic', 2000)
    return () => {
      sound.stopBgMusic(1000)
    }
  }, [sound])

  // Typing animation
  useEffect(() => {
    if (currentStep >= 1 && titleTextRef.current) {
      let currentIndex = 0
      const text = fullTitle
      setTypedText('')

      const typingInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setTypedText(text.slice(0, currentIndex + 1))
          sound.play('textType', { volume: 0.2 })
          currentIndex++
        } else {
          clearInterval(typingInterval)
          // Start underline animation
          if (underlineRef.current) {
            gsap.fromTo(
              underlineRef.current,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.8, ease: 'power2.out' }
            )
          }
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [currentStep, fullTitle, sound])

  // Glitch effect (random)
  useEffect(() => {
    if (currentStep >= 1) {
      const glitchInterval = setInterval(() => {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 100)
      }, 5000 + Math.random() * 5000)

      return () => clearInterval(glitchInterval)
    }
  }, [currentStep])

  // Create orbiting particles around card
  useEffect(() => {
    if (!cardParticlesRef.current || !cardRef.current) return

    const particleCount = 12
    const particles: HTMLDivElement[] = []

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'absolute w-1 h-1 bg-red-500 rounded-full'
      particle.style.boxShadow = '0 0 10px rgba(233, 69, 96, 0.8)'
      particle.style.willChange = 'transform'
      cardParticlesRef.current.appendChild(particle)
      particles.push(particle)

      const angle = (360 / particleCount) * i
      const radius = 120
      const duration = 3 + Math.random() * 2

      gsap.to(particle, {
        rotation: 360,
        duration,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%',
        motionPath: {
          path: `M ${Math.cos((angle * Math.PI) / 180) * radius} ${Math.sin((angle * Math.PI) / 180) * radius} A ${radius} ${radius} 0 1 1 ${Math.cos((angle * Math.PI) / 180) * radius} ${Math.sin((angle * Math.PI) / 180) * radius}`,
          autoRotate: true,
        },
      })
    }

    return () => {
      particles.forEach((p) => p.remove())
    }
  }, [])

  // Animation sequence
  useEffect(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline({
      onComplete: () => {
        setSkippable(true)
      },
    })

    // Initial fade from black (2 seconds)
    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 2, ease: 'power2.inOut' }
    )
      // Card appears ENORME with 3D rotation
      .fromTo(
        cardRef.current,
        {
          scale: 0,
          opacity: 0,
          rotationX: -180,
          rotationY: -180,
          z: -500,
        },
        {
          scale: 1,
          opacity: 1,
          rotationX: 0,
          rotationY: 0,
          z: 0,
          duration: 1.5,
          ease: 'back.out(1.7)',
          transformStyle: 'preserve-3d',
          onStart: () => {
            sound.play('cardReveal', { volume: 0.8 })
          },
        }
      )
      // Pulsing neon glow on card
      .to(
        cardRef.current,
        {
          boxShadow: '0 0 60px rgba(233, 69, 96, 1), 0 0 120px rgba(233, 69, 96, 0.6), 0 0 180px rgba(233, 69, 96, 0.4)',
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut',
        },
        '-=0.5'
      )
      // Title appears with typing animation
      .call(() => setCurrentStep(1))
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        },
        '-=0.3'
      )
      // Difficulty section appears
      .call(() => setCurrentStep(2))
      .fromTo(
        difficultyRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.5)',
        },
        '-=0.2'
      )
      // Fill difficulty bars
      .to(difficultyBarsRef.current, {
        scaleX: 1,
        duration: 1,
        stagger: 0.05,
        ease: 'power2.out',
        onStart: () => {
          sound.play('ruleReveal', { volume: 0.3 })
        },
      })
      // Situation appears line by line
      .call(() => setCurrentStep(3))
      .fromTo(
        situationRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      )
      // Rules appear one by one
      .call(() => setCurrentStep(4))
      .fromTo(
        rulesRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        }
      )
      .to(ruleItemsRef.current, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.3,
        ease: 'back.out(1.5)',
        onStart: () => {
          ruleItemsRef.current.forEach((el, i) => {
            if (el) {
              gsap.set(el, { opacity: 0, x: -50, scale: 0.8 })
              setTimeout(() => {
                sound.play('ruleReveal', { volume: 0.3 })
              }, i * 300)
            }
          })
        },
      })
      // Victory/Defeat conditions
      .call(() => setCurrentStep(5))
      .fromTo(
        conditionsRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.5)',
        }
      )
      // Time limit
      .call(() => setCurrentStep(6))
      .fromTo(
        timerRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.5)',
        }
      )
      // Start button appears
      .call(() => setCurrentStep(7))
      .fromTo(
        startButtonRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.5)',
        }
      )
      // Button pulse effect
      .to(startButtonRef.current, {
        boxShadow: '0 0 30px rgba(233, 69, 96, 0.8), 0 0 60px rgba(233, 69, 96, 0.4)',
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      })

    return () => {
      tl.kill()
    }
  }, [])

  // Countdown animation
  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
        sound.play('countdown', { volume: 0.6 })
        
        // Animate countdown number
        if (countdownRef.current) {
          gsap.fromTo(
            countdownRef.current,
            { scale: 0, opacity: 0, rotation: -180 },
            {
              scale: 1.5,
              opacity: 1,
              rotation: 0,
              duration: 0.3,
              ease: 'back.out(2)',
            }
          )
          gsap.to(countdownRef.current, {
            scale: 1,
            duration: 0.7,
            ease: 'power2.out',
          })
        }

        // Animate circle
        if (countdownCircleRef.current) {
          const progress = (3 - countdown) / 3
          const circumference = 2 * Math.PI * 90
          const offset = circumference * (1 - progress)
          gsap.to(countdownCircleRef.current, {
            strokeDashoffset: offset,
            duration: 1,
            ease: 'power2.out',
          })
        }

        // Particle explosion
        createCountdownParticles()
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setTimeout(() => {
        handleFadeOutAndStart()
      }, 500)
    }
  }, [countdown])

  const createCountdownParticles = () => {
    if (!countdownRef.current) return

    const rect = countdownRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div')
      particle.className = 'absolute w-2 h-2 bg-red-500 rounded-full'
      particle.style.left = `${centerX}px`
      particle.style.top = `${centerY}px`
      particle.style.boxShadow = '0 0 10px rgba(233, 69, 96, 0.8)'
      particle.style.willChange = 'transform'
      document.body.appendChild(particle)

      const angle = (360 / 20) * i
      const distance = 100 + Math.random() * 50
      const duration = 0.8 + Math.random() * 0.4

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
  }

  const handleStart = () => {
    sound.play('click')
    sound.stopBgMusic(500)
    setCountdown(3)
  }

  const handleFadeOutAndStart = () => {
    if (!containerRef.current) return

    const tl = gsap.timeline({
      onComplete: onStart,
    })

    tl.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: 'power2.in',
    })
  }

  const handleSkip = () => {
    sound.play('click')
    sound.stopBgMusic(500)
    handleFadeOutAndStart()
  }

  // Get game-specific content
  const getGameContent = () => {
    if (game.suit === 'hearts') {
      return {
        situation: 'Tendrán que decidir quién vive y quién muere. La traición puede ser su mejor arma... o su perdición.',
        rules: [
          'Cada jugador tiene un voto secreto',
          'Deben elegir a quién eliminar',
          'Los votos se revelan cuando todos hayan votado',
          'El más votado es eliminado',
        ],
        victory: 'Sobrevivir hasta el final',
        defeat: 'Ser eliminado por los votos',
      }
    }
    if (game.suit === 'clubs') {
      return {
        situation: 'Solo trabajando juntos podrán sobrevivir. La confianza es su única arma.',
        rules: [
          'Deben resolver los desafíos en equipo',
          'Cualquiera puede contribuir con respuestas',
          'La comunicación es clave para el éxito',
          'Todos deben participar activamente',
        ],
        victory: 'Completar todos los desafíos',
        defeat: 'Fallar en los desafíos o no colaborar',
      }
    }
    if (game.suit === 'diamonds') {
      return {
        situation: 'Su inteligencia será puesta a prueba. La lógica y el razonamiento rápido son esenciales.',
        rules: [
          'Cada jugador tiene turnos individuales',
          'Deben resolver problemas de lógica',
          'La velocidad importa',
          'Cada respuesta correcta cuenta',
        ],
        victory: 'Resolver todos los problemas correctamente',
        defeat: 'Fallar en los problemas o quedarse sin tiempo',
      }
    }
    if (game.suit === 'spades') {
      return {
        situation: 'Su resistencia física y mental será probada. Solo los más fuertes sobrevivirán.',
        rules: [
          'Deben completar desafíos físicos',
          'Cada jugador debe confirmar su completación',
          'La resistencia es crucial',
          'No hay atajos, solo esfuerzo',
        ],
        victory: 'Todos completan los desafíos',
        defeat: 'No poder completar los desafíos a tiempo',
      }
    }
    return {
      situation: game.description,
      rules: ['Sigue las instrucciones del juego', 'Completa los objetivos', 'Sobrevive hasta el final'],
      victory: 'Completar todos los objetivos',
      defeat: 'No completar los objetivos a tiempo',
    }
  }

  const content = getGameContent()
  const difficultyBars = Array.from({ length: 10 }, (_, i) => i < game.difficulty)

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden perspective-3d"
      style={{ opacity: 0 }}
    >
      {/* Skip button */}
      {skippable && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 px-4 py-2 glass rounded-lg text-red-400 hover:text-red-300 hover:neon-shadow-red transition-all flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          SALTAR INTRO
        </button>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 space-y-6 sm:space-y-8 text-center relative z-10">
        {/* Card Symbol - ENORME */}
        <div className="relative mb-4 sm:mb-8">
          <div
            ref={cardRef}
            className="text-[8rem] sm:text-[12rem] md:text-[15rem] relative mx-auto"
            style={{
              textShadow: '0 0 60px rgba(233, 69, 96, 1), 0 0 120px rgba(233, 69, 96, 0.6), 0 0 180px rgba(233, 69, 96, 0.4)',
              filter: 'drop-shadow(0 0 40px rgba(233, 69, 96, 0.8))',
              transformStyle: 'preserve-3d',
            }}
          >
            {suitEmoji}
          </div>
          {/* Orbiting particles */}
          <div ref={cardParticlesRef} className="absolute inset-0 pointer-events-none" />
        </div>

        {/* Title with typing animation */}
        <div ref={titleRef} style={{ opacity: 0 }} className="mb-4 sm:mb-6">
          <h1
            ref={titleTextRef}
            className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-wider ${
              glitchActive ? 'glitch' : ''
            }`}
            data-text={fullTitle}
            style={{
              textShadow: '2px 2px 0px rgba(233, 69, 96, 0.5), 4px 4px 0px rgba(233, 69, 96, 0.3)',
            }}
          >
            {typedText}
            <span className="opacity-0">{fullTitle}</span>
          </h1>
          {/* Animated underline */}
          <div
            ref={underlineRef}
            className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"
            style={{
              maxWidth: '100%',
              transformOrigin: 'left',
              boxShadow: '0 0 20px rgba(233, 69, 96, 0.8)',
            }}
          />
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-bold text-red-500 mt-3 sm:mt-4 neon-red"
            style={{
              textShadow: '0 0 20px rgba(233, 69, 96, 0.8)',
            }}
          >
            {game.name.toUpperCase()}
          </h2>
        </div>

        {/* Difficulty with visual bars */}
        {currentStep >= 2 && (
          <div ref={difficultyRef} style={{ opacity: 0 }} className="mb-4 sm:mb-8">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-300 mb-3 sm:mb-4">JUEGO DE {suitName.toUpperCase()} - DIFICULTAD</p>
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4 px-4">
              {difficultyBars.map((filled, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    if (el) difficultyBarsRef.current[index] = el
                  }}
                  className="h-6 sm:h-8 flex-1 max-w-[30px] sm:max-w-[40px] origin-left"
                  style={{
                    transform: 'scaleX(0)',
                    background: filled
                      ? `linear-gradient(90deg, ${index < game.difficulty ? '#e94560' : '#4a4a4a'}, ${index < game.difficulty ? '#ff0033' : '#4a4a4a'})`
                      : '#2a2a2a',
                    boxShadow: filled
                      ? '0 0 10px rgba(233, 69, 96, 0.6), inset 0 0 10px rgba(255, 0, 51, 0.3)'
                      : 'none',
                    borderRadius: '4px',
                  }}
                />
              ))}
            </div>
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold neon-red">{game.difficulty}/10</p>
          </div>
        )}

        {/* Situation */}
        {currentStep >= 3 && (
          <div
            ref={situationRef}
            className="glass-strong rounded-lg p-4 sm:p-6 md:p-8 max-w-3xl mx-auto border border-red-600/30"
            style={{ opacity: 0 }}
          >
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 mb-4 sm:mb-6 neon-red">SITUACIÓN:</h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed">{content.situation}</p>
            <span className="inline-block w-2 h-6 bg-red-500 ml-2 animate-pulse" />
          </div>
        )}

        {/* Rules */}
        {currentStep >= 4 && (
          <div
            ref={rulesRef}
            className="max-w-3xl mx-auto space-y-3 sm:space-y-4"
            style={{ opacity: 0 }}
          >
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 mb-4 sm:mb-6 neon-red">REGLAS:</h3>
            <div className="space-y-2 sm:space-y-3">
              {content.rules.map((rule, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    if (el) ruleItemsRef.current[index] = el
                  }}
                  className="glass rounded-lg p-3 sm:p-4 flex items-start gap-3 sm:gap-4 hover:neon-shadow-red transition-all"
                  style={{ opacity: 0 }}
                >
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 neon-shadow-red"
                    style={{
                      boxShadow: '0 0 20px rgba(233, 69, 96, 0.8)',
                    }}
                  >
                    <span className="text-white font-bold text-sm sm:text-lg">{index + 1}</span>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-gray-200 flex-1 text-left">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Victory/Defeat */}
        {currentStep >= 5 && (
          <div
            ref={conditionsRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto"
            style={{ opacity: 0 }}
          >
            <div
              className="glass-strong rounded-lg p-4 sm:p-6 border-2 relative overflow-hidden"
              style={{
                borderColor: 'rgba(78, 204, 163, 0.5)',
                boxShadow: '0 0 30px rgba(78, 204, 163, 0.3), inset 0 0 30px rgba(78, 204, 163, 0.1)',
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'linear-gradient(45deg, rgba(78, 204, 163, 0.3), transparent)',
                }}
              />
              <h4 className="text-green-400 font-bold mb-2 sm:mb-3 text-lg sm:text-xl neon-green relative z-10">✓ VICTORIA:</h4>
              <p className="text-sm sm:text-base text-gray-200 relative z-10">{content.victory}</p>
            </div>
            <div
              className="glass-strong rounded-lg p-4 sm:p-6 border-2 relative overflow-hidden"
              style={{
                borderColor: 'rgba(233, 69, 96, 0.5)',
                boxShadow: '0 0 30px rgba(233, 69, 96, 0.3), inset 0 0 30px rgba(233, 69, 96, 0.1)',
              }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'linear-gradient(45deg, rgba(233, 69, 96, 0.3), transparent)',
                }}
              />
              <h4 className="text-red-400 font-bold mb-2 sm:mb-3 text-lg sm:text-xl neon-red relative z-10">✗ DERROTA:</h4>
              <p className="text-sm sm:text-base text-gray-200 relative z-10">{content.defeat}</p>
            </div>
          </div>
        )}

        {/* Time Limit */}
        {currentStep >= 6 && (
          <div
            ref={timerRef}
            className="glass-strong rounded-lg p-4 sm:p-6 max-w-md mx-auto border-2"
            style={{
              opacity: 0,
              borderColor: 'rgba(233, 69, 96, 0.5)',
              boxShadow: '0 0 30px rgba(233, 69, 96, 0.4)',
            }}
          >
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-400 neon-red">
              TIEMPO LÍMITE: {Math.floor(game.timeLimit / 60)} minutos
            </p>
          </div>
        )}

        {/* Countdown */}
        {countdown !== null && countdown > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/95 z-50">
            <div className="relative">
              {/* SVG Circle */}
              <svg className="w-48 h-48 sm:w-64 sm:h-64 transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                />
                <circle
                  ref={countdownCircleRef}
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#e94560"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={2 * Math.PI * 90}
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(233, 69, 96, 0.8))',
                  }}
                />
              </svg>
              {/* Countdown number */}
              <div
                ref={countdownRef}
                className="absolute inset-0 flex items-center justify-center text-6xl sm:text-8xl md:text-9xl font-bold text-red-500"
                style={{
                  textShadow: '0 0 60px rgba(233, 69, 96, 1), 0 0 120px rgba(233, 69, 96, 0.6)',
                  filter: 'drop-shadow(0 0 40px rgba(233, 69, 96, 1))',
                }}
              >
                {countdown}
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        {currentStep >= 7 && countdown === null && (
          <div className="mt-6 sm:mt-8">
            <button
              ref={startButtonRef}
              onClick={handleStart}
              className="w-full sm:w-auto px-8 sm:px-12 md:px-16 py-4 sm:py-5 text-lg sm:text-xl md:text-2xl font-bold rounded-lg transition-all btn-base relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #e94560, #ff0033)',
                color: 'white',
                boxShadow: '0 0 30px rgba(233, 69, 96, 0.6)',
                border: '2px solid rgba(233, 69, 96, 0.5)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                INICIAR JUEGO
              </span>
              {/* Scanning border effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'scanning 2s linear infinite',
                }}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
