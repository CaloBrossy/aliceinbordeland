'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRoom } from '@/hooks/useRoom'
import { nextGame, leaveRoom } from '@/lib/roomManager'
import { calculateGameResults } from '@/lib/gameLogic'
import { useGSAP } from '@/hooks/useGSAP'
import { useSoundContext } from '@/components/SoundProvider'
import { Trophy, Skull, Users, LogOut, Play, Home } from 'lucide-react'

interface ResultScreenProps {
  roomId: string
  roomCode: string
}

export default function ResultScreen({ roomId, roomCode }: ResultScreenProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { room, players } = useRoom(roomId)
  const gsap = useGSAP()
  const { playSound } = useSounds()
  const sound = useSoundContext()

  const isHost = room?.host_id === user?.id
  const game = room?.current_game as any

  const gameClearRef = useRef<HTMLDivElement>(null)
  const gameOverRef = useRef<HTMLDivElement>(null)
  const survivorsRef = useRef<HTMLDivElement>(null)
  const eliminatedRef = useRef<HTMLDivElement>(null)
  const eliminatedItemsRef = useRef<(HTMLDivElement | null)[]>([])
  const survivorItemsRef = useRef<(HTMLDivElement | null)[]>([])

  if (!game || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando resultados...</p>
        </div>
      </div>
    )
  }

  const results = calculateGameResults(game, { timer: 0, round: 1, votes: {}, answers: {}, current_turn: null, id: '', room_id: roomId, updated_at: '' }, players)

  // Stop game music on mount
  useEffect(() => {
    sound.stopBgMusic()
  }, [sound])

  // Animate results on mount
  useEffect(() => {
    if (results.gameClear && gameClearRef.current) {
      gsap.animateGameClear(gameClearRef.current)
      sound.play('gameClear', { volume: 0.9 })
    } else if (!results.gameClear && gameOverRef.current) {
      gsap.animateGameOver(gameOverRef.current)
      sound.play('gameOver', { volume: 0.9 })
    }
  }, [results.gameClear, gsap, sound])

  // Animate survivors
  useEffect(() => {
    if (survivorsRef.current && survivorItemsRef.current.length > 0) {
      const validItems = survivorItemsRef.current.filter((item) => item !== null)
      if (validItems.length > 0) {
        gsap.animateStaggerFadeIn(validItems)
      }
    }
  }, [results.survivors, gsap])

  // Animate eliminated players with death animation
  useEffect(() => {
    if (eliminatedItemsRef.current.length > 0) {
      const validItems = eliminatedItemsRef.current.filter((item) => item !== null)
      if (validItems.length > 0) {
        validItems.forEach((element, index) => {
          setTimeout(() => {
            gsap.animateDeath(element)
            sound.play('death', { volume: 0.6 })
          }, index * 200) // Stagger deaths
        })
      }
    }
  }, [results.eliminated, gsap, sound])

  const handleNextGame = async () => {
    if (!isHost || !user) return

    setLoading(true)
    setError(null)

    try {
      const result = await nextGame(roomId, user.id)
      if (!result.success) {
        setError(result.error || 'Error al iniciar siguiente juego')
        setLoading(false)
      }
      // Navigation will happen automatically
    } catch (err: any) {
      setError(err.message || 'Error al iniciar siguiente juego')
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!user) return

    const result = await leaveRoom(roomId, user.id)
    if (result.success) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen p-4 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Result Header */}
        <div className="text-center space-y-4">
          {results.gameClear ? (
            <div ref={gameClearRef}>
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-12 h-12 text-yellow-500" />
                <h1 className="text-4xl font-bold text-green-500">GAME CLEAR</h1>
              </div>
              <p className="text-gray-400">¡Al menos un jugador sobrevivió!</p>
            </div>
          ) : (
            <div ref={gameOverRef}>
              <div className="flex items-center justify-center gap-3">
                <Skull className="w-12 h-12 text-red-500" />
                <h1 className="text-4xl font-bold text-red-500">GAME OVER</h1>
              </div>
              <p className="text-gray-400">Todos los jugadores fueron eliminados</p>
            </div>
          )}
        </div>

        {/* Game Info */}
        {game && (
          <div className="glass rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">{game.name}</h2>
            <p className="text-gray-400">{game.card}</p>
            <p className="text-sm text-gray-500 mt-2">{game.description}</p>
          </div>
        )}

        {/* Survivors */}
        {results.survivors.length > 0 && (
          <div ref={survivorsRef} className="glass rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-white">Sobrevivientes</h2>
            </div>
            <div className="space-y-2">
              {results.survivors.map((player, index) => (
                <div
                  key={player.id}
                  ref={(el) => {
                    if (el) survivorItemsRef.current[index] = el
                  }}
                  className="flex items-center justify-between p-4 bg-green-900/20 border border-green-600 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="text-white font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      {player.cards} {player.cards === 1 ? 'carta' : 'cartas'}
                    </span>
                    {player.user_id === user?.id && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Tú</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eliminated */}
        {results.eliminated.length > 0 && (
          <div ref={eliminatedRef} className="glass rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skull className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Eliminados</h2>
            </div>
            <div className="space-y-2">
              {results.eliminated.map((player, index) => (
                <div
                  key={player.id}
                  ref={(el) => {
                    if (el) eliminatedItemsRef.current[index] = el
                  }}
                  className="flex items-center justify-between p-4 bg-red-900/20 border border-red-600 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Skull className="w-5 h-5 text-red-500" />
                    <span className="text-gray-400 line-through">{player.name}</span>
                  </div>
                  {player.user_id === user?.id && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Tú</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Estadísticas</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#0a0a0a] rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Jugadores Totales</p>
              <p className="text-2xl font-bold text-white">{players.length}</p>
            </div>
            <div className="p-4 bg-[#0a0a0a] rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Sobrevivientes</p>
              <p className="text-2xl font-bold text-green-500">{results.survivors.length}</p>
            </div>
            <div className="p-4 bg-[#0a0a0a] rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Eliminados</p>
              <p className="text-2xl font-bold text-red-500">{results.eliminated.length}</p>
            </div>
            <div className="p-4 bg-[#0a0a0a] rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Dificultad</p>
              <p className="text-2xl font-bold text-white">{game.difficulty || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Actions (Host only) */}
        {isHost && (
          <div className="flex gap-4">
            <button
              onClick={handleNextGame}
              disabled={loading}
              className="flex-1 py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Siguiente Juego
                </>
              )}
            </button>
            <button
              onClick={handleLeave}
              className="px-6 py-4 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Volver al Inicio
            </button>
          </div>
        )}

        {/* Non-host message */}
        {!isHost && (
          <div className="glass rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-4">Esperando a que el host inicie el siguiente juego...</p>
            <button
              onClick={handleLeave}
              className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
            >
              <LogOut className="w-4 h-4" />
              Salir de la Sala
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

