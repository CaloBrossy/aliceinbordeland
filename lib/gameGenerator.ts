import type { Game, GameSuit, HeartsGame, ClubsGame, DiamondsGame, SpadesGame } from '@/types/game'
import { gamesLibrary, getSuitName } from '@/data/gamesLibrary'

export function generateRandomGame(
  players: { id: string }[],
  previousGames: string[] = []
): Game {
  // 1. Elegir palo aleatorio
  const suits: GameSuit[] = ['hearts', 'clubs', 'diamonds', 'spades']
  const suit = suits[Math.floor(Math.random() * suits.length)]

  // 2. Elegir dificultad (más jugadores = más difícil)
  const baseDifficulty = Math.floor(Math.random() * 5) + 3 // 3-7
  const playerModifier = Math.floor(players.length / 3)
  const difficulty = Math.min(10, baseDifficulty + playerModifier)

  // 3. Seleccionar juego del pool (evitar repetidos)
  const availableGames = gamesLibrary[suit].filter(
    (g) => !previousGames.includes(g.id)
  )

  // Si todos los juegos ya se jugaron, resetear
  const gamePool = availableGames.length > 0 ? availableGames : gamesLibrary[suit]
  const selectedGame = gamePool[Math.floor(Math.random() * gamePool.length)]

  // 4. Generar variantes dinámicas
  const timeLimit = difficulty * 60

  const baseGame = {
    ...selectedGame,
    suit,
    difficulty,
    timeLimit,
    card: `${difficulty} de ${getSuitName(suit)}`,
  }

  // Generar parámetros dinámicos según el tipo de juego
  if (suit === 'hearts') {
    const heartsGame = baseGame as HeartsGame
    return {
      ...heartsGame,
      parameters: {
        revealed: false,
      },
    }
  }

  if (suit === 'clubs') {
    const clubsGame = baseGame as ClubsGame
    return {
      ...clubsGame,
      parameters: {
        currentRiddle: 0,
        sharedAnswer: '',
        sequence: [],
      },
    }
  }

  if (suit === 'diamonds') {
    const diamondsGame = baseGame as DiamondsGame
    // Generar orden aleatorio de turnos
    const turnOrder = [...players].sort(() => Math.random() - 0.5).map((p) => p.id)
    return {
      ...diamondsGame,
      parameters: {
        currentProblem: 0,
        currentPlayer: turnOrder[0] || null,
        turnOrder,
      },
    }
  }

  if (suit === 'spades') {
    const spadesGame = baseGame as SpadesGame
    const completions: Record<string, boolean> = {}
    players.forEach((p) => {
      completions[p.id] = false
    })
    return {
      ...spadesGame,
      parameters: {
        currentChallenge: 0,
        completions,
      },
    }
  }

  return baseGame as Game
}

export function generateSpecificGame(
  gameId: string,
  suit: GameSuit,
  players: { id: string }[],
  difficulty?: number
): Game | null {
  const gamePool = gamesLibrary[suit]
  const selectedGame = gamePool.find((g) => g.id === gameId)

  if (!selectedGame) return null

  const finalDifficulty = difficulty || Math.floor(Math.random() * 5) + 3
  const playerModifier = Math.floor(players.length / 3)
  const adjustedDifficulty = Math.min(10, finalDifficulty + playerModifier)
  const timeLimit = adjustedDifficulty * 60

  const baseGame = {
    ...selectedGame,
    suit,
    difficulty: adjustedDifficulty,
    timeLimit,
    card: `${adjustedDifficulty} de ${getSuitName(suit)}`,
  }

  // Generar parámetros dinámicos
  if (suit === 'hearts') {
    return {
      ...baseGame,
      parameters: {
        revealed: false,
      },
    } as HeartsGame
  }

  if (suit === 'clubs') {
    return {
      ...baseGame,
      parameters: {
        currentRiddle: 0,
        sharedAnswer: '',
        sequence: [],
      },
    } as ClubsGame
  }

  if (suit === 'diamonds') {
    const turnOrder = [...players].sort(() => Math.random() - 0.5).map((p) => p.id)
    return {
      ...baseGame,
      parameters: {
        currentProblem: 0,
        currentPlayer: turnOrder[0] || null,
        turnOrder,
      },
    } as DiamondsGame
  }

  if (suit === 'spades') {
    const completions: Record<string, boolean> = {}
    players.forEach((p) => {
      completions[p.id] = false
    })
    return {
      ...baseGame,
      parameters: {
        currentChallenge: 0,
        completions,
      },
    } as SpadesGame
  }

  return baseGame as Game
}

