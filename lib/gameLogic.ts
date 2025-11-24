import type { Game, Player, GameState, HeartsGame, ClubsGame, DiamondsGame, SpadesGame } from '@/types/game'

export function validateVote(
  game: Game,
  gameState: GameState,
  playerId: string,
  targetPlayerId: string,
  players: Player[]
): { valid: boolean; error?: string } {
  // Check if player is alive
  const player = players.find((p) => p.id === playerId)
  if (!player || !player.alive) {
    return { valid: false, error: 'Jugador no está vivo' }
  }

  // Check if target is valid
  const target = players.find((p) => p.id === targetPlayerId)
  if (!target || !target.alive) {
    return { valid: false, error: 'Objetivo inválido' }
  }

  // Check if player already voted
  const votes = (gameState.votes as Record<string, string>) || {}
  if (votes[playerId]) {
    return { valid: false, error: 'Ya has votado' }
  }

  // Check if player is voting for themselves (not allowed in most games)
  if (playerId === targetPlayerId && game.suit === 'hearts') {
    const heartsGame = game as HeartsGame
    if (heartsGame.mechanic !== 'majority_rules') {
      return { valid: false, error: 'No puedes votar por ti mismo' }
    }
  }

  return { valid: true }
}

export function calculateVoteResults(
  game: Game,
  gameState: GameState,
  players: Player[]
): { eliminated: string[]; survivors: string[] } {
  const votes = (gameState.votes as Record<string, string>) || {}
  const alivePlayers = players.filter((p) => p.alive)

  if (game.suit !== 'hearts') {
    return { eliminated: [], survivors: alivePlayers.map((p) => p.id) }
  }

  const heartsGame = game as HeartsGame

  if (heartsGame.mechanic === 'vote_elimination') {
    // Witch Hunt: Eliminate the most voted player
    const voteCounts: Record<string, number> = {}
    alivePlayers.forEach((p) => {
      voteCounts[p.id] = 0
    })

    Object.values(votes).forEach((targetId) => {
      if (voteCounts[targetId] !== undefined) {
        voteCounts[targetId]++
      }
    })

    const maxVotes = Math.max(...Object.values(voteCounts))
    const eliminated = Object.entries(voteCounts)
      .filter(([_, count]) => count === maxVotes)
      .map(([id]) => id)

    const survivors = alivePlayers
      .filter((p) => !eliminated.includes(p.id))
      .map((p) => p.id)

    return { eliminated, survivors }
  }

  if (heartsGame.mechanic === 'majority_rules') {
    // Majority Rules: Eliminate the most voted player
    const voteCounts: Record<string, number> = {}
    alivePlayers.forEach((p) => {
      voteCounts[p.id] = 0
    })

    Object.values(votes).forEach((targetId) => {
      if (voteCounts[targetId] !== undefined) {
        voteCounts[targetId]++
      }
    })

    const maxVotes = Math.max(...Object.values(voteCounts), 0)
    const eliminated = Object.entries(voteCounts)
      .filter(([_, count]) => count === maxVotes && maxVotes > 0)
      .map(([id]) => id)

    const survivors = alivePlayers
      .filter((p) => !eliminated.includes(p.id))
      .map((p) => p.id)

    return { eliminated, survivors }
  }

  if (heartsGame.mechanic === 'prisoners_dilemma') {
    // Trust Fall: Complex logic based on cooperation
    // For simplicity, eliminate players who betrayed
    const eliminated: string[] = []
    const survivors: string[] = []

    alivePlayers.forEach((player) => {
      const vote = votes[player.id]
      // If player voted to betray, they might be eliminated
      // This is a simplified version
      if (vote === 'betray') {
        eliminated.push(player.id)
      } else {
        survivors.push(player.id)
      }
    })

    return { eliminated, survivors }
  }

  return { eliminated: [], survivors: alivePlayers.map((p) => p.id) }
}

export function validateAnswer(
  game: Game,
  answer: any,
  players: Player[]
): { valid: boolean; correct?: boolean; error?: string } {
  if (game.suit === 'clubs') {
    const clubsGame = game as ClubsGame
    // For collaborative games, any answer is valid if it's not empty
    if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
      return { valid: false, error: 'La respuesta no puede estar vacía' }
    }
    return { valid: true, correct: true }
  }

  if (game.suit === 'diamonds') {
    const diamondsGame = game as DiamondsGame
    // For logic games, validate based on game type
    if (diamondsGame.mechanic === 'speed_math') {
      // Validate math answer (simplified)
      if (typeof answer !== 'number' && typeof answer !== 'string') {
        return { valid: false, error: 'Respuesta inválida' }
      }
      // In a real implementation, you'd check against the correct answer
      return { valid: true, correct: true }
    }
    return { valid: true, correct: true }
  }

  if (game.suit === 'spades') {
    // For physical challenges, just check if they confirmed
    if (answer !== true && answer !== 'completed') {
      return { valid: false, error: 'Debes confirmar la completación' }
    }
    return { valid: true, correct: true }
  }

  return { valid: true, correct: true }
}

export function checkGameCompletion(
  game: Game,
  gameState: GameState,
  players: Player[]
): { completed: boolean; success: boolean; reason?: string } {
  const alivePlayers = players.filter((p) => p.alive && p.connected)

  // Check if all players are dead
  if (alivePlayers.length === 0) {
    return { completed: true, success: false, reason: 'Todos los jugadores fueron eliminados' }
  }

  // Check if timer ran out
  if (gameState.timer <= 0) {
    return { completed: true, success: false, reason: 'Tiempo agotado' }
  }

  if (game.suit === 'hearts') {
    const heartsGame = game as HeartsGame
    // Check if all rounds completed
    if (gameState.round > heartsGame.rounds) {
      return { completed: true, success: alivePlayers.length > 0, reason: 'Rondas completadas' }
    }

    // Check if all players voted
    const votes = (gameState.votes as Record<string, string>) || {}
    const allVoted = alivePlayers.every((p) => votes[p.id])
    if (allVoted && alivePlayers.length > 0) {
      return { completed: false, success: false } // Round complete, but game continues
    }
  }

  if (game.suit === 'clubs') {
    const clubsGame = game as ClubsGame
    if (clubsGame.mechanic === 'collaborative_riddles') {
      const answers = (gameState.answers as Record<string, any>) || {}
      const currentRiddle = (clubsGame.parameters?.currentRiddle || 0) + 1
      if (currentRiddle > (clubsGame.riddles || 5)) {
        return { completed: true, success: true, reason: 'Todos los acertijos resueltos' }
      }
    }
  }

  if (game.suit === 'diamonds') {
    const diamondsGame = game as DiamondsGame
    if (diamondsGame.mechanic === 'speed_math') {
      const currentProblem = diamondsGame.parameters?.currentProblem || 0
      if (currentProblem >= (diamondsGame.problems || 10)) {
        return { completed: true, success: true, reason: 'Todos los problemas resueltos' }
      }
    }
  }

  if (game.suit === 'spades') {
    const spadesGame = game as SpadesGame
    const completions = spadesGame.parameters?.completions || {}
    const allCompleted = alivePlayers.every((p) => completions[p.id] === true)
    if (allCompleted && alivePlayers.length > 0) {
      return { completed: true, success: true, reason: 'Todos completaron el desafío' }
    }
  }

  return { completed: false, success: false }
}

export function calculateGameResults(
  game: Game,
  gameState: GameState,
  players: Player[]
): {
  survivors: Player[]
  eliminated: Player[]
  winners: Player[]
  gameClear: boolean
} {
  const alivePlayers = players.filter((p) => p.alive && p.connected)
  const deadPlayers = players.filter((p) => !p.alive || !p.connected)

  // Game is clear if at least one player survived
  const gameClear = alivePlayers.length > 0

  // Winners are survivors who completed the game
  const winners = alivePlayers

  return {
    survivors: alivePlayers,
    eliminated: deadPlayers,
    winners,
    gameClear,
  }
}

export function updatePlayerCards(players: Player[], winners: Player[], cardsPerWin: number = 1): Player[] {
  return players.map((player) => {
    const isWinner = winners.some((w) => w.id === player.id)
    return {
      ...player,
      cards: isWinner ? player.cards + cardsPerWin : player.cards,
    }
  })
}

