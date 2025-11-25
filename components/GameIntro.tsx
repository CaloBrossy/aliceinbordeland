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
  const sound = useSoundContext()
  
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const difficultyRef = useRef<HTMLDivElement>(null)
  const situationRef = useRef<HTMLDivElement>(null)
  const rulesRef = useRef<HTMLDivElement>(null)
  const ruleItemsRef = useRef<(HTMLLIElement | null)[]>([])
  const conditionsRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const countdownRef = useRef<HTMLDivElement>(null)
  const startButtonRef = useRef<HTMLButtonElement>(null)

  const suitEmoji = getSuitEmoji(game.suit)
  const suitName = getSuitName(game.suit)

  // Play intro music
  useEffect(() => {
    sound.playBgMusic('bgmIntro')
    return () => {
      sound.stopBgMusic()
    }
  }, [sound])

  // Animation sequence
  useEffect(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline({
      onComplete: () => {
        setSkippable(true)
      },
    })

    // Initial black screen
    tl.set(containerRef.current, { opacity: 1 })
      // Card appears with glow
      .fromTo(
        cardRef.current,
        {
          scale: 0,
          opacity: 0,
          rotation: -180,
        },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 1.2,
          ease: 'back.out(1.7)',
          onStart: () => {
            sound.play('gameStart')
          },
        }
      )
      // Add glow effect to card
      .to(cardRef.current, {
        boxShadow: '0 0 40px rgba(220, 38, 38, 0.8), 0 0 80px rgba(220, 38, 38, 0.4)',
        duration: 0.5,
        repeat: 3,
        yoyo: true,
        ease: 'power2.inOut',
      })
      // Title appears
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          onStart: () => {
            sound.play('reveal')
          },
        },
        '-=0.3'
      )
      // Difficulty appears
      .fromTo(
        difficultyRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.2'
      )
      // Situation appears line by line
      .call(() => setCurrentStep(1))
      .fromTo(
        situationRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      )
      // Rules appear one by one
      .call(() => setCurrentStep(2))
      .fromTo(
        rulesRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        }
      )
      // Animate each rule item
      .to(ruleItemsRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power2.out',
        onStart: () => {
          ruleItemsRef.current.forEach((el) => {
            if (el) {
              gsap.set(el, { opacity: 0, x: -30 })
            }
          })
        },
      })
      // Victory/Defeat conditions
      .call(() => setCurrentStep(3))
      .fromTo(
        conditionsRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      )
      // Time limit
      .call(() => setCurrentStep(4))
      .fromTo(
        timerRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.5)',
        }
      )
      // Start button pulse
      .call(() => setCurrentStep(5))
      .fromTo(
        startButtonRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.5)',
        }
      )
      .to(startButtonRef.current, {
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)',
        duration: 0.5,
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
      // Play countdown sound
      sound.play('countdown', { volume: 0.8 })
      
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
        // Play countdown sound
        playSound('countdown')
        // Animate countdown number
        if (countdownRef.current) {
          gsap.fromTo(
            countdownRef.current,
            { scale: 0, opacity: 0 },
            {
              scale: 1.5,
              opacity: 1,
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
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Countdown finished, start game
      sound.play('gameStart', { volume: 0.9 })
      setTimeout(() => {
        handleFadeOutAndStart()
      }, 500)
    }
  }, [countdown, sound])

  const handleStart = () => {
    sound.play('click')
    sound.stopBgMusic()
    setCountdown(3)
  }

  const handleFadeOutAndStart = () => {
    if (!containerRef.current) return

    const tl = gsap.timeline({
      onComplete: () => {
        sound.playBgMusic('bgmGame')
        onStart()
      },
    })

    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in',
    })
  }

  const handleSkip = () => {
    sound.play('click')
    sound.stopBgMusic()
    handleFadeOutAndStart()
  }

  // Get game-specific content
  const getGameContent = () => {
    // Hearts games
    if (game.suit === 'hearts') {
      if (game.mechanic === 'vote_elimination') {
        return {
          situation: 'Uno de ustedes es un impostor. Deben identificar y eliminar a la amenaza antes de que sea demasiado tarde.',
          rules: [
            'Cada jugador tiene un voto secreto',
            'Deben elegir quién es el impostor',
            'Los votos se revelan cuando todos hayan votado',
            'El más votado es eliminado inmediatamente',
          ],
          victory: 'Eliminar al impostor correcto',
          defeat: 'Ser eliminado por votos erróneos',
        }
      }
      if (game.mechanic === 'prisoners_dilemma') {
        return {
          situation: 'Enfrentan un dilema. Colaborar puede salvarlos a todos... o pueden traicionarse mutuamente.',
          rules: [
            'Cada jugador decide: colaborar o traicionar',
            'La decisión es secreta hasta el reveal',
            'Las consecuencias dependen de las decisiones del grupo',
            'La traición puede ser letal',
          ],
          victory: 'Sobrevivir a través de la cooperación',
          defeat: 'Ser eliminado por traición o desconfianza',
        }
      }
      return {
        situation: 'Tendrán que decidir quién vive y quién muere. La mayoría manda, pero ¿serán justos?',
        rules: [
          'Cada jugador tiene un voto público',
          'Deben elegir a quién eliminar',
          'La mayoría decide el destino',
          'El más votado es eliminado',
        ],
        victory: 'Sobrevivir hasta el final',
        defeat: 'Ser eliminado por la mayoría',
      }
    }
    // Clubs games
    if (game.suit === 'clubs') {
      if (game.mechanic === 'collaborative_riddles') {
        return {
          situation: 'Atrapados en una habitación con acertijos mortales. Solo trabajando juntos podrán resolverlos todos.',
          rules: [
            'Deben resolver acertijos en equipo',
            'Cualquiera puede contribuir con respuestas',
            'La comunicación es esencial',
            'Todos deben participar activamente',
          ],
          victory: 'Resolver todos los acertijos correctamente',
          defeat: 'Fallar en los acertijos o no colaborar',
        }
      }
      if (game.mechanic === 'sequential_collaboration') {
        return {
          situation: 'Deben construir algo juntos. Cada uno aporta una pieza del rompecabezas.',
          rules: [
            'Cada jugador contribuye en secuencia',
            'Deben construir sobre las contribuciones anteriores',
            'La coordinación es crucial',
            'Todos deben participar en orden',
          ],
          victory: 'Completar la construcción exitosamente',
          defeat: 'Fallar en la colaboración o romper la cadena',
        }
      }
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
    // Diamonds games
    if (game.suit === 'diamonds') {
      if (game.mechanic === 'speed_math') {
        return {
          situation: 'Su inteligencia será puesta a prueba con problemas matemáticos. La velocidad y precisión son esenciales.',
          rules: [
            'Cada jugador tiene turnos individuales',
            'Deben resolver ecuaciones rápidamente',
            'La velocidad importa más que la perfección',
            'Cada respuesta correcta cuenta',
          ],
          victory: 'Resolver todos los problemas correctamente',
          defeat: 'Fallar en los problemas o quedarse sin tiempo',
        }
      }
      if (game.mechanic === 'pattern_recognition') {
        return {
          situation: 'Encuentren el patrón oculto. Su capacidad de observación y lógica serán probadas.',
          rules: [
            'Identifiquen el patrón en la secuencia',
            'Tienen intentos limitados',
            'La lógica es más importante que la velocidad',
            'Cada intento cuenta',
          ],
          victory: 'Identificar el patrón correctamente',
          defeat: 'Agotar todos los intentos o no encontrar el patrón',
        }
      }
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
    // Spades games
    if (game.suit === 'spades') {
      if (game.mechanic === 'timed_questions') {
        return {
          situation: 'Responderán preguntas bajo presión extrema. La honestidad y rapidez pueden salvarlos.',
          rules: [
            'Deben responder preguntas personales',
            'Tienen tiempo limitado por pregunta',
            'La honestidad puede ser cuestionada',
            'Cada respuesta debe ser válida',
          ],
          victory: 'Completar todas las preguntas a tiempo',
          defeat: 'Fallar en responder o quedarse sin tiempo',
        }
      }
      if (game.mechanic === 'physical_challenges') {
        return {
          situation: 'Su resistencia física será probada. Solo los más fuertes y determinados sobrevivirán.',
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
        situation: 'Su resistencia física y mental será probada. Solo los más fuertes sobrevivirán.',
        rules: [
          'Deben completar desafíos de resistencia',
          'Cada jugador debe mantenerse hasta el final',
          'La determinación es clave',
          'El último en rendirse gana',
        ],
        victory: 'Sobrevivir hasta el final',
        defeat: 'Rendirse antes que los demás',
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

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
      style={{ opacity: 0 }}
    >
      {/* Glitch effect overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-transparent to-transparent" />
      </div>

      {/* Skip button */}
      {skippable && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 px-4 py-2 border border-red-600/50 text-red-400 hover:bg-red-600/10 rounded-lg transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          SALTAR INTRO
        </button>
      )}

      <div className="max-w-4xl mx-auto px-4 space-y-8 text-center">
        {/* Card Symbol */}
        <div
          ref={cardRef}
          className="text-9xl mb-4 relative"
          style={{
            textShadow: '0 0 40px rgba(220, 38, 38, 0.8), 0 0 80px rgba(220, 38, 38, 0.4)',
            filter: 'drop-shadow(0 0 30px rgba(220,38,38,0.8))',
          }}
        >
          <span className="relative z-10">{suitEmoji}</span>
          {/* Glow effect */}
          <div
            className="absolute inset-0 -z-10 blur-3xl"
            style={{
              background: `radial-gradient(circle, rgba(220,38,38,0.6) 0%, transparent 70%)`,
              transform: 'scale(1.5)',
            }}
          />
        </div>

        {/* Title */}
        <div ref={titleRef} style={{ opacity: 0 }}>
          <h1
            className="text-6xl font-bold text-white mb-2 tracking-wider"
            style={{
              textShadow: '2px 2px 0px rgba(220,38,38,0.5), 4px 4px 0px rgba(220,38,38,0.3)',
            }}
          >
            {game.card.split(' ')[0]} DE {suitName.toUpperCase()}
          </h1>
          <h2
            className="text-3xl font-bold text-red-500 mb-6"
            style={{
              textShadow: '0 0 20px rgba(220,38,38,0.8)',
            }}
          >
            {game.name.toUpperCase()}
          </h2>
        </div>

        {/* Difficulty */}
        <div ref={difficultyRef} style={{ opacity: 0 }}>
          <p
            className="text-2xl font-bold text-gray-300 mb-8 border-t border-b border-red-600/30 py-4 px-8"
            style={{
              textShadow: '0 0 10px rgba(220,38,38,0.5)',
            }}
          >
            JUEGO DE {suitName.toUpperCase()} - DIFICULTAD {game.difficulty}
          </p>
        </div>

        {/* Situation */}
        {currentStep >= 1 && (
          <div
            ref={situationRef}
            className="glass rounded-lg p-6 max-w-2xl mx-auto border border-red-600/30"
            style={{ opacity: 0 }}
          >
            <h3
              className="text-xl font-bold text-red-500 mb-4"
              style={{
                textShadow: '0 0 10px rgba(220,38,38,0.6)',
              }}
            >
              SITUACIÓN:
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed">{content.situation}</p>
          </div>
        )}

        {/* Rules */}
        {currentStep >= 2 && (
          <div
            ref={rulesRef}
            className="glass rounded-lg p-6 max-w-2xl mx-auto text-left border border-red-600/30"
            style={{ opacity: 0 }}
          >
            <h3
              className="text-xl font-bold text-red-500 mb-4 text-center"
              style={{
                textShadow: '0 0 10px rgba(220,38,38,0.6)',
              }}
            >
              REGLAS:
            </h3>
            <ul className="space-y-3">
              {content.rules.map((rule, index) => (
                <li
                  key={index}
                  ref={(el) => {
                    if (el) ruleItemsRef.current[index] = el
                  }}
                  className="text-gray-300 flex items-start gap-3"
                  style={{ opacity: 0 }}
                >
                  <span
                    className="text-red-500 font-bold text-xl min-w-[30px]"
                    style={{
                      textShadow: '0 0 10px rgba(220,38,38,0.8)',
                    }}
                  >
                    {index + 1}.
                  </span>
                  <span className="text-lg">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Victory/Defeat */}
        {currentStep >= 3 && (
          <div
            ref={conditionsRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
            style={{ opacity: 0 }}
          >
            <div
              className="glass rounded-lg p-4 border border-green-600/50"
              style={{
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
              }}
            >
              <h4
                className="text-green-500 font-bold mb-2"
                style={{
                  textShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
                }}
              >
                ✓ VICTORIA:
              </h4>
              <p className="text-gray-300">{content.victory}</p>
            </div>
            <div
              className="glass rounded-lg p-4 border border-red-600/50"
              style={{
                boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
              }}
            >
              <h4
                className="text-red-500 font-bold mb-2"
                style={{
                  textShadow: '0 0 10px rgba(220, 38, 38, 0.8)',
                }}
              >
                ✗ DERROTA:
              </h4>
              <p className="text-gray-300">{content.defeat}</p>
            </div>
          </div>
        )}

        {/* Time Limit */}
        {currentStep >= 4 && (
          <div
            ref={timerRef}
            className="glass rounded-lg p-4 max-w-md mx-auto border border-red-600"
            style={{
              opacity: 0,
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)',
            }}
          >
            <p
              className="text-xl font-bold text-red-400"
              style={{
                textShadow: '0 0 10px rgba(220, 38, 38, 0.8)',
              }}
            >
              TIEMPO LÍMITE: {Math.floor(game.timeLimit / 60)} minutos
            </p>
          </div>
        )}

        {/* Countdown */}
        {countdown !== null && countdown > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/95 z-50">
            <div
              ref={countdownRef}
              className="text-9xl font-bold text-red-500 relative"
              style={{
                textShadow: '0 0 60px rgba(220, 38, 38, 1), 0 0 120px rgba(220, 38, 38, 0.6)',
                filter: 'drop-shadow(0 0 40px rgba(220,38,38,1))',
              }}
            >
              {countdown}
              {/* Glow effect */}
              <div
                className="absolute inset-0 -z-10 blur-3xl"
                style={{
                  background: `radial-gradient(circle, rgba(220,38,38,0.8) 0%, transparent 70%)`,
                  transform: 'scale(2)',
                }}
              />
            </div>
          </div>
        )}

        {/* Start Button */}
        {currentStep >= 5 && countdown === null && (
          <div className="mt-8">
            <button
              ref={startButtonRef}
              onClick={handleStart}
              className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold rounded-lg transition-colors flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(220,38,38,0.6)]"
            >
              <Play className="w-6 h-6" />
              COMENZAR JUEGO
            </button>
          </div>
        )}
      </div>

      {/* Subtle particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: 'float 10s infinite ease-in-out',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  )
}

