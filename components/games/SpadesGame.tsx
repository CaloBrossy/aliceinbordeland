'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGame } from '@/hooks/useGame'
import type { SpadesGame, Player } from '@/types/game'
import { validateAnswer } from '@/lib/gameLogic'
import { Activity, CheckCircle } from 'lucide-react'

interface SpadesGameProps {
  game: SpadesGame
  players: Player[]
  roomId: string
}

export default function SpadesGameComponent({ game, players, roomId }: SpadesGameProps) {
  const { user } = useAuth()
  const { gameState, submitAnswer } = useGame(roomId)
  const [completed, setCompleted] = useState(false)

  const currentPlayer = players.find((p) => p.user_id === user?.id)
  const completions = (game.parameters?.completions as Record<string, boolean>) || {}
  const allCompleted = players.filter((p) => p.alive && p.connected).every((p) => completions[p.id] === true)

  const handleComplete = async () => {
    if (!currentPlayer) return

    const validation = validateAnswer(game, true, players)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    const result = await submitAnswer(currentPlayer.id, true)
    if (result.success) {
      setCompleted(true)
    }
  }

  if (!currentPlayer || !currentPlayer.alive) {
    return (
      <div className="text-center p-8">
        <p className="text-red-400 text-lg">Has sido eliminado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{game.name}</h2>
        <p className="text-gray-400">{game.description}</p>
      </div>

      <div className="glass rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 text-purple-500 mb-4">
          <Activity className="w-5 h-5" />
          <span className="font-bold">Desafío Físico</span>
        </div>

        <div className="p-4 bg-[#0a0a0a] rounded-lg border border-purple-600/30">
          <p className="text-white mb-2 font-bold">Instrucciones:</p>
          <ul className="text-gray-300 space-y-2 list-disc list-inside">
            <li>Mantén la posición de plancha durante 30 segundos</li>
            <li>O realiza 20 flexiones</li>
            <li>O mantén el equilibrio en un pie durante 1 minuto</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Elige uno de los desafíos y confirma cuando lo completes
          </p>
        </div>

        {!completed ? (
          <button
            onClick={handleComplete}
            className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            He Completado el Desafío
          </button>
        ) : (
          <div className="p-4 bg-purple-900/20 border border-purple-600 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-purple-400 font-bold">Desafío Completado</p>
            <p className="text-sm text-gray-400 mt-2">
              Esperando a que todos completen...
            </p>
          </div>
        )}
      </div>

      {/* Completion Status */}
      <div className="glass rounded-lg p-6">
        <h3 className="text-white font-bold mb-3">Estado del Equipo:</h3>
        <div className="space-y-2">
          {players
            .filter((p) => p.alive && p.connected)
            .map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg"
              >
                <span className="text-white">{player.name}</span>
                {completions[player.id] ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-500 rounded-full" />
                )}
              </div>
            ))}
        </div>
        {allCompleted && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-600 rounded-lg text-center">
            <p className="text-green-400 font-bold">¡Todos completaron el desafío!</p>
          </div>
        )}
      </div>
    </div>
  )
}

