'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRoom } from '@/hooks/useRoom'
import { useGame } from '@/hooks/useGame'
import { useGSAP } from '@/hooks/useGSAP'
import { useSoundContext } from '@/components/SoundProvider'
import { endGame, leaveRoom, updatePlayerConnection } from '@/lib/roomManager'
import { checkGameCompletion } from '@/lib/gameLogic'
import HeartsGame from './games/HeartsGame'
import ClubsGame from './games/ClubsGame'
import DiamondsGame from './games/DiamondsGame'
import SpadesGame from './games/SpadesGame'
import GameIntro from './GameIntro'
import PlayerCard from './PlayerCard'
import { getSuitEmoji, getSuitColor } from '@/data/gamesLibrary'
import type { Game } from '@/types/game'
import { Clock, Users, LogOut, Skull } from 'lucide-react'
import { gsap } from 'gsap'

interface GameScreenProps {
  roomId: string
  roomCode: string
}

export default function GameScreen({ roomId, roomCode }: GameScreenProps) {
  const [timer, setTimer] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const router = useRouter()
  const { user } = useAuth()
  const { room, players } = useRoom(roomId)
  const { gameState, updateTimer } = useGame(roomId)
  const gsap = useGSAP()
  const sound = useSoundContext()

  const isHost = room?.host_id === user?.id
  const game = room?.current_game as Game | null
  const alivePlayers = players.filter((p) => p.alive && p.connected)

  const gameCardRef = useRef<HTMLDivElement>(null)
  const gameTitleRef = useRef<HTMLHeadingElement>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const timerTextRef = useRef<HTMLSpanElement>(null)
  const gameContentRef = useRef<HTMLDivElement>(null)
  const playersGridRef = useRef<HTMLDivElement>(null)

  // Update connection status
  useEffect(() => {
    if (user && roomId) {
      updatePlayerConnection(roomId, user.id, true)

      const handleVisibilityChange = () => {
        updatePlayerConnection(roomId, user.id, !document.hidden)
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        updatePlayerConnection(roomId, user.id, false)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [user, roomId])

  // Animate game card on mount
  useEffect(() => {
    if (gameCardRef.current && game) {
      gsap.animateCardFlip(gameCardRef.current)
    }
    if (gameContentRef.current) {
      gsap.animateStaggerFadeIn([gameContentRef.current])
    }
    if (playersGridRef.current) {
      const cards = playersGridRef.current.querySelectorAll('[data-player-card]')
      gsap.fromTo(
        Array.from(cards),
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.5)',
        }
      )
    }
  }, [game, gsap, players])

  // Glitch effect on title (random)
  useEffect(() => {
    if (!gameTitleRef.current) return

    const glitchInterval = setInterval(() => {
      gsap.to(gameTitleRef.current, {
        x: -2,
        duration: 0.05,
        yoyo: true,
        repeat: 3,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(gameTitleRef.current, { x: 0 })
        },
      })
    }, 5000 + Math.random() * 5000)

    return () => clearInterval(glitchInterval)
  }, [])

  // Play ambient music
  useEffect(() => {
    if (!showIntro && game) {
      sound.playBgMusic('ambientMusic', 2000)
    }
    return () => {
      sound.stopBgMusic(1000)
    }
  }, [showIntro, game, sound])

  // Timer countdown
  useEffect(() => {
    if (gameState?.timer !== undefined) {
      setTimer(gameState.timer)
    }
  }, [gameState?.timer])

  // Animate timer when low
  useEffect(() => {
    if (timer > 0 && timer <= 60 && timerRef.current) {
      // Pulse animation when timer is low
      gsap.animatePulse(timerRef.current, 1)
      // Play heartbeat sound when timer is very low
      if (timer <= 30 && timer > 0) {
        sound.play('heartbeat', { volume: 0.3, loop: true })
      } else {
        sound.stop('heartbeat')
      }
    } else {
      sound.stop('heartbeat')
    }
  }, [timer, gsap, sound])

  // Play tick sound for countdown
  useEffect(() => {
    if (timer > 0 && timer <= 10) {
      const tickInterval = setInterval(() => {
        sound.play('tick', { volume: 0.5 })
      }, 1000)
      return () => clearInterval(tickInterval)
    }
  }, [timer, sound])

  useEffect(() => {
    if (timer <= 0 || !gameState) return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })

      // Update timer in database every 5 seconds
      if (timer % 5 === 0) {
        updateTimer(timer - 1)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timer, gameState, updateTimer])

  // Check game completion
  useEffect(() => {
    if (!game || !gameState || !isHost) return

    const checkCompletion = async () => {
      const completion = checkGameCompletion(game, gameState, players)
      if (completion.completed) {
        // End game
        await endGame(roomId, user!.id)
      }
    }

    const interval = setInterval(checkCompletion, 2000)
    return () => clearInterval(interval)
  }, [game, gameState, players, isHost, roomId, user])

  const handleEndGame = async () => {
    if (!isHost || !user) return

    if (confirm('¿Estás seguro de terminar el juego?')) {
      const result = await endGame(roomId, user.id)
      if (result.success) {
        // Navigation will happen automatically
      }
    }
  }

  const handleLeave = async () => {
    if (!user) return

    if (confirm('¿Estás seguro de abandonar el juego?')) {
      const result = await leaveRoom(roomId, user.id)
      if (result.success) {
        router.push('/')
      }
    }
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando juego...</p>
        </div>
      </div>
    )
  }

  // Show intro first
  if (showIntro) {
    return (
      <GameIntro
        game={game}
        onStart={() => setShowIntro(false)}
        onSkip={() => setShowIntro(false)}
      />
    )
  }

  const suitColor = getSuitColor(game.suit)
  const suitEmoji = getSuitEmoji(game.suit)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header - Mejorado con efectos AAA */}
      <div className="glass-strong border-b-2 relative overflow-hidden" style={{ borderColor: 'rgba(233, 69, 96, 0.3)' }}>
        {/* Gradient background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(90deg, rgba(233, 69, 96, 0.1), transparent, rgba(0, 217, 255, 0.1))',
          }}
        />
        <div className="relative z-10 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div ref={gameCardRef} className="flex items-center gap-4">
              <div
                className="text-4xl"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(233, 69, 96, 0.8))',
                  textShadow: '0 0 30px rgba(233, 69, 96, 0.6)',
                }}
              >
                {suitEmoji}
              </div>
              <div>
                <h1
                  ref={gameTitleRef}
                  className="text-2xl font-bold text-white mb-1"
                  style={{
                    textShadow: '2px 2px 0px rgba(233, 69, 96, 0.5)',
                  }}
                >
                  {game.card}
                </h1>
                <p className="text-sm text-gray-400">{game.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              {/* Timer - Mejorado */}
              <div
                ref={timerRef}
                className="glass rounded-lg px-4 py-2 flex items-center gap-2"
                style={{
                  border: '1px solid rgba(233, 69, 96, 0.3)',
                  boxShadow: timer < 60 ? '0 0 20px rgba(233, 69, 96, 0.4)' : 'none',
                }}
              >
                <Clock
                  className={`w-5 h-5 ${timer < 60 ? 'text-red-500' : 'text-gray-400'}`}
                  style={{
                    filter: timer < 60 ? 'drop-shadow(0 0 10px rgba(233, 69, 96, 0.8))' : 'none',
                  }}
                />
                <span
                  ref={timerTextRef}
                  className={`font-mono font-bold text-lg ${
                    timer < 60 ? 'text-red-500' : 'text-white'
                  }`}
                  style={{
                    textShadow: timer < 60 ? '0 0 20px rgba(255, 0, 51, 0.8)' : 'none',
                  }}
                >
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Alive Players - Mejorado */}
              <div
                className="glass rounded-lg px-4 py-2 flex items-center gap-2"
                style={{
                  border: '1px solid rgba(78, 204, 163, 0.3)',
                  boxShadow: '0 0 20px rgba(78, 204, 163, 0.2)',
                }}
              >
                <Users className="w-5 h-5 text-green-400" style={{ filter: 'drop-shadow(0 0 10px rgba(78, 204, 163, 0.8))' }} />
                <span className="text-white font-bold text-lg">
                  <span className="text-green-400">{alivePlayers.length}</span>
                  <span className="text-gray-400">/{players.length}</span>
                </span>
              </div>

              {/* Leave Button - Mejorado */}
              <button
                onClick={handleLeave}
                className="btn-base glass rounded-lg px-4 py-2 border border-red-600/30 text-red-400 hover:text-red-300 hover:neon-shadow-red transition-all flex items-center gap-2"
                title="Abandonar juego"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="p-4 border-b border-red-600/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Jugadores
          </h2>
          <div
            ref={playersGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {players.map((player) => (
              <div key={player.id} data-player-card>
                <PlayerCard
                  player={player}
                  isCurrentUser={player.user_id === user?.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div ref={gameContentRef} className="max-w-4xl mx-auto">
          {game.suit === 'hearts' && (
            <HeartsGame game={game as any} players={players} roomId={roomId} />
          )}
          {game.suit === 'clubs' && (
            <ClubsGame game={game as any} players={players} roomId={roomId} />
          )}
          {game.suit === 'diamonds' && (
            <DiamondsGame game={game as any} players={players} roomId={roomId} />
          )}
          {game.suit === 'spades' && (
            <SpadesGame game={game as any} players={players} roomId={roomId} />
          )}
        </div>
      </div>

      {/* Footer (Host only) */}
      {isHost && (
        <div className="glass border-t border-red-600/30 p-4">
          <div className="max-w-6xl mx-auto flex justify-end">
            <button
              onClick={handleEndGame}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <Skull className="w-4 h-4" />
              Terminar Juego
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

