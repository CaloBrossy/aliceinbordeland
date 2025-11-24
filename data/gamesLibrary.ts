import type { HeartsGame, ClubsGame, DiamondsGame, SpadesGame } from '@/types/game'

export const heartsGames: Omit<HeartsGame, 'suit' | 'difficulty' | 'timeLimit' | 'card'>[] = [
  {
    id: 'witch_hunt',
    name: 'Witch Hunt',
    description: 'Voten quién es la "bruja". Si aciertan todos sobreviven menos la bruja.',
    mechanic: 'vote_elimination',
    rounds: 3,
    votingType: 'secret',
  },
  {
    id: 'trust_fall',
    name: 'Trust Fall',
    description: 'Dilema del prisionero: ¿Colaborar o traicionar?',
    mechanic: 'prisoners_dilemma',
    rounds: 2,
    votingType: 'secret',
  },
  {
    id: 'majority_rules',
    name: 'Majority Rules',
    description: 'La mayoría decide quién se sacrifica cada ronda',
    mechanic: 'majority_vote',
    rounds: 3,
    votingType: 'open',
  },
]

export const clubsGames: Omit<ClubsGame, 'suit' | 'difficulty' | 'timeLimit' | 'card'>[] = [
  {
    id: 'riddle_room',
    name: 'Riddle Room',
    description: 'Resuelvan 5 acertijos en equipo',
    mechanic: 'collaborative_riddles',
    riddles: 5,
    discussionTime: 120,
  },
  {
    id: 'word_chain',
    name: 'Word Chain',
    description: 'Construyan una cadena de palabras. Cada jugador añade una palabra relacionada.',
    mechanic: 'sequential_collaboration',
    targetLength: 15,
  },
  {
    id: 'memory_palace',
    name: 'Memory Palace',
    description: 'Memoricen una secuencia juntos. Cada uno recuerda una parte.',
    mechanic: 'distributed_memory',
    sequenceLength: 20,
  },
]

export const diamondsGames: Omit<DiamondsGame, 'suit' | 'difficulty' | 'timeLimit' | 'card'>[] = [
  {
    id: 'math_race',
    name: 'Math Race',
    description: 'Resuelvan ecuaciones. El más rápido gana puntos.',
    mechanic: 'speed_math',
    problems: 10,
    difficulty: 'dynamic',
  },
  {
    id: 'pattern_break',
    name: 'Pattern Break',
    description: 'Identifiquen el patrón en la secuencia',
    mechanic: 'pattern_recognition',
    attempts: 3,
  },
  {
    id: 'logic_gates',
    name: 'Logic Gates',
    description: 'Resuelvan un circuito lógico paso a paso',
    mechanic: 'boolean_logic',
    complexity: 'medium',
  },
]

export const spadesGames: Omit<SpadesGame, 'suit' | 'difficulty' | 'timeLimit' | 'card'>[] = [
  {
    id: 'hot_seat',
    name: 'Hot Seat',
    description: 'Respondan preguntas personales bajo presión de tiempo',
    mechanic: 'timed_questions',
    questionsPerPlayer: 3,
    timePerQuestion: 10,
  },
  {
    id: 'dare_or_dare',
    name: 'Dare or Dare',
    description: 'Completen desafíos físicos. Confirmen cuando terminen.',
    mechanic: 'physical_challenges',
    challenges: 5,
  },
  {
    id: 'endurance_test',
    name: 'Endurance Test',
    description: 'Mantengan una posición/acción. Último en rendirse gana.',
    mechanic: 'last_standing',
    checkInterval: 30,
  },
]

export const gamesLibrary = {
  hearts: heartsGames,
  clubs: clubsGames,
  diamonds: diamondsGames,
  spades: spadesGames,
}

export function getSuitName(suit: 'hearts' | 'clubs' | 'diamonds' | 'spades'): string {
  const names = {
    hearts: 'Corazones',
    clubs: 'Tréboles',
    diamonds: 'Diamantes',
    spades: 'Picas',
  }
  return names[suit]
}

export function getSuitEmoji(suit: 'hearts' | 'clubs' | 'diamonds' | 'spades'): string {
  const emojis = {
    hearts: '♥️',
    clubs: '♣️',
    diamonds: '♦️',
    spades: '♠️',
  }
  return emojis[suit]
}

export function getSuitColor(suit: 'hearts' | 'clubs' | 'diamonds' | 'spades'): string {
  const colors = {
    hearts: 'text-red-500',
    clubs: 'text-green-500',
    diamonds: 'text-blue-500',
    spades: 'text-purple-500',
  }
  return colors[suit]
}

