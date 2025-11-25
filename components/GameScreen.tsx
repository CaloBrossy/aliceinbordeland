'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRoom } from '@/hooks/useRoom'
import { useGame } from '@/hooks/useGame'
import { useGSAP } from '@/hooks/useGSAP'
import { endGame, leaveRoom, updatePlayerConnection } from '@/lib/roomManager'
import { checkGameCompletion } from '@/lib/gameLogic'
import HeartsGame from './games/HeartsGame'
import ClubsGame from './games/ClubsGame'
import DiamondsGame from './games/DiamondsGame'
import SpadesGame from './games/SpadesGame'
import GameIntro from './GameIntro'
import { getSuitEmoji, getSuitColor } from '@/data/gamesLibrary'
import type { Game } from '@/types/game'
import { Clock, Users, LogOut, Skull } from 'lucide-react'

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

  const isHost = room?.host_id === user?.id
  const game = room?.current_game as Game | null
  const alivePlayers = players.filter((p) => p.alive && p.connected)

  const gameCardRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const gameContentRef = useRef<HTMLDivElement>(null)

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
  }, [game, gsap])

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
    }
  }, [timer, gsap])

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
      {/* Header */}
      <div className="glass border-b border-red-600/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div ref={gameCardRef} className="flex items-center gap-4">
            <div className="text-3xl">{suitEmoji}</div>
            <div>
              <h1 className="text-xl font-bold text-white">{game.card}</h1>
              <p className="text-sm text-gray-400">{game.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Timer */}
            <div ref={timerRef} className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timer < 60 ? 'text-red-500' : 'text-gray-400'}`} />
              <span className={`font-mono font-bold ${timer < 60 ? 'text-red-500' : 'text-white'}`}>
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Alive Players */}
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-white font-bold">
                {alivePlayers.length}/{players.length}
              </span>
            </div>

            {/* Leave Button */}
            <button
              onClick={handleLeave}
              className="p-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              title="Abandonar juego"
            >
              <LogOut className="w-4 h-4" />
            </button>
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

