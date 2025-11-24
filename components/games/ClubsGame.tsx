'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGame } from '@/hooks/useGame'
import type { ClubsGame, Player } from '@/types/game'
import { validateAnswer } from '@/lib/gameLogic'
import { Users, Send } from 'lucide-react'

interface ClubsGameProps {
  game: ClubsGame
  players: Player[]
  roomId: string
}

export default function ClubsGameComponent({ game, players, roomId }: ClubsGameProps) {
  const { user } = useAuth()
  const { gameState, submitAnswer } = useGame(roomId)
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const currentPlayer = players.find((p) => p.user_id === user?.id)
  const answers = (gameState?.answers as Record<string, any>) || {}
  const sharedAnswers = Object.entries(answers).map(([playerId, ans]) => ({
    playerId,
    playerName: players.find((p) => p.id === playerId)?.name || 'Jugador',
    answer: ans,
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPlayer || !answer.trim()) return

    const validation = validateAnswer(game, answer.trim(), players)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    const result = await submitAnswer(currentPlayer.id, answer.trim())
    if (result.success) {
      setSubmitted(true)
      setAnswer('')
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
        {game.mechanic === 'collaborative_riddles' && (
          <p className="text-sm text-gray-500 mt-2">
            Acertijo {((game.parameters?.currentRiddle || 0) + 1)} de {game.riddles}
          </p>
        )}
      </div>

      <div className="glass rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 text-green-500 mb-4">
          <Users className="w-5 h-5" />
          <span className="font-bold">Trabajo en Equipo</span>
        </div>

        {/* Example riddle/problem */}
        <div className="p-4 bg-[#0a0a0a] rounded-lg border border-green-600/30">
          <p className="text-white mb-2">Ejemplo de acertijo:</p>
          <p className="text-gray-300">
            "Tengo ciudades pero no casas, tengo montañas pero no árboles, tengo agua pero no peces. ¿Qué soy?"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Escribe tu respuesta..."
            disabled={submitted}
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-green-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!answer.trim() || submitted}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Respuesta
          </button>
        </form>

        {submitted && (
          <div className="p-3 bg-green-900/20 border border-green-600 rounded-lg text-green-400 text-sm">
            Respuesta enviada. Trabajando en equipo...
          </div>
        )}
      </div>

      {/* Shared answers */}
      {sharedAnswers.length > 0 && (
        <div className="glass rounded-lg p-6">
          <h3 className="text-white font-bold mb-3">Respuestas del equipo:</h3>
          <div className="space-y-2">
            {sharedAnswers.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0a0a0a] rounded-lg border border-green-600/30"
              >
                <p className="text-sm text-gray-400 mb-1">{item.playerName}:</p>
                <p className="text-white">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

