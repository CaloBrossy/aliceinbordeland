'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGame } from '@/hooks/useGame'
import { useGSAP } from '@/hooks/useGSAP'
import type { HeartsGame, Player } from '@/types/game'
import { validateVote, calculateVoteResults } from '@/lib/gameLogic'
import { Users, Vote } from 'lucide-react'

interface HeartsGameProps {
  game: HeartsGame
  players: Player[]
  roomId: string
}

export default function HeartsGameComponent({ game, players, roomId }: HeartsGameProps) {
  const { user } = useAuth()
  const { gameState, submitVote, nextRound } = useGame(roomId)
  const gsap = useGSAP()
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const currentPlayer = players.find((p) => p.user_id === user?.id)
  const alivePlayers = players.filter((p) => p.alive && p.connected && p.user_id !== user?.id)
  const votes = (gameState?.votes as Record<string, string>) || {}

  const revealResultsRef = useRef<HTMLDivElement>(null)
  const voteButtonsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    // Check if player already voted
    if (currentPlayer && votes[currentPlayer.id]) {
      setVoted(true)
      setSelectedTarget(votes[currentPlayer.id])
    }

    // Check if all players voted (reveal votes)
    const allVoted = alivePlayers.length > 0 && alivePlayers.every((p) => votes[p.id])
    if (allVoted && !revealed && gameState) {
      setRevealed(true)
      // Animate reveal
      if (revealResultsRef.current) {
        setTimeout(() => {
          gsap.animateReveal(revealResultsRef.current)
        }, 100)
      }
    }
  }, [votes, currentPlayer, alivePlayers, revealed, gameState, gsap])

  const handleVote = async (targetId: string) => {
    if (!currentPlayer || !gameState) return

    const validation = validateVote(game, gameState, currentPlayer.id, targetId, players)
    if (!validation.valid) {
      // Shake animation for invalid vote
      const button = voteButtonsRef.current.find((el) => el && el.dataset.playerId === targetId)
      if (button) {
        gsap.animateShake(button)
      }
      alert(validation.error)
      return
    }

    const result = await submitVote(currentPlayer.id, targetId)
    if (result.success) {
      setSelectedTarget(targetId)
      setVoted(true)
      // Pulse animation on successful vote
      const button = voteButtonsRef.current.find((el) => el && el.dataset.playerId === targetId)
      if (button) {
        gsap.animatePulse(button, 1)
      }
    }
  }

  const handleReveal = () => {
    if (!gameState || !currentPlayer) return

    const results = calculateVoteResults(game, gameState, players)
    // In a real implementation, you'd update the game state with results
    setRevealed(true)
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
        <p className="text-sm text-gray-500 mt-2">
          Ronda {gameState?.round || 1} de {game.rounds}
        </p>
      </div>

      {game.votingType === 'secret' && !revealed ? (
        <>
          {!voted ? (
            <div className="space-y-4">
              <p className="text-center text-gray-300">Selecciona tu voto:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alivePlayers.map((player, index) => (
                  <button
                    key={player.id}
                    ref={(el) => {
                      if (el) voteButtonsRef.current[index] = el
                      el?.setAttribute('data-player-id', player.id)
                    }}
                    onClick={() => handleVote(player.id)}
                    className="p-4 bg-[#1a1a1a] border-2 border-red-600 rounded-lg hover:bg-red-600/20 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-red-600" />
                      <span className="text-white font-medium">{player.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <Vote className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-gray-300">Voto registrado</p>
              <p className="text-sm text-gray-500 mt-2">
                Esperando a que todos voten...
              </p>
            </div>
          )}
        </>
      ) : (
        <div ref={revealResultsRef} className="space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-600 rounded-lg">
            <p className="text-red-400 font-bold mb-4">Resultados de la votación:</p>
            <div className="space-y-2">
              {alivePlayers.map((player) => {
                const voteCount = Object.values(votes).filter((v) => v === player.id).length
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded"
                  >
                    <span className="text-white">{player.name}</span>
                    <span className="text-red-400 font-bold">{voteCount} votos</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

