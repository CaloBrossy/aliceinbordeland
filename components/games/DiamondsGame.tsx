'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGame } from '@/hooks/useGame'
import type { DiamondsGame, Player } from '@/types/game'
import { validateAnswer } from '@/lib/gameLogic'
import { Brain, Clock } from 'lucide-react'

interface DiamondsGameProps {
  game: DiamondsGame
  players: Player[]
  roomId: string
}

export default function DiamondsGameComponent({ game, players, roomId }: DiamondsGameProps) {
  const { user } = useAuth()
  const { gameState, submitAnswer } = useGame(roomId)
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)

  const currentPlayer = players.find((p) => p.user_id === user?.id)
  const turnOrder = (game.parameters?.turnOrder as string[]) || []
  const currentTurnPlayerId = game.parameters?.currentPlayer as string | null
  const isMyTurn = currentTurnPlayerId === currentPlayer?.id
  const currentTurnPlayer = players.find((p) => p.id === currentTurnPlayerId)

  useEffect(() => {
    if (isMyTurn && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isMyTurn, timeLeft])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPlayer || !answer.trim() || !isMyTurn) return

    const validation = validateAnswer(game, answer.trim(), players)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    const result = await submitAnswer(currentPlayer.id, answer.trim())
    if (result.success) {
      setAnswer('')
      // In a real implementation, you'd move to the next player
    }
  }

  if (!currentPlayer || !currentPlayer.alive) {
    return (
      <div className="text-center p-8">
        <p className="text-red-400 text-lg">Has sido eliminado</p>
      </div>
    )
  }

  if (!isMyTurn) {
    return (
      <div className="text-center p-8 space-y-4">
        <Brain className="w-16 h-16 text-blue-500 mx-auto" />
        <p className="text-gray-300 text-lg">
          Esperando a <span className="text-blue-400 font-bold">{currentTurnPlayer?.name || 'otro jugador'}</span>...
        </p>
        <p className="text-sm text-gray-500">Es el turno de resolver el problema</p>
      </div>
    )
  }

  // Example problem
  const problems = [
    { question: '2 + 2 = ?', answer: '4' },
    { question: '¿Cuál es la raíz cuadrada de 16?', answer: '4' },
    { question: '5 × 7 = ?', answer: '35' },
  ]
  const currentProblem = problems[0] // In real implementation, get from game state

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{game.name}</h2>
        <p className="text-gray-400">{game.description}</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="text-blue-400 font-bold">{timeLeft}s</span>
        </div>
      </div>

      <div className="glass rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 text-blue-500 mb-4">
          <Brain className="w-5 h-5" />
          <span className="font-bold">Tu Turno</span>
        </div>

        <div className="p-4 bg-[#0a0a0a] rounded-lg border border-blue-600/30">
          <p className="text-white text-xl mb-4">{currentProblem.question}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Tu respuesta..."
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-blue-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            autoFocus
          />
          <button
            type="submit"
            disabled={!answer.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar Respuesta
          </button>
        </form>
      </div>
    </div>
  )
}

