export type GameSuit = 'hearts' | 'clubs' | 'diamonds' | 'spades';
export type RoomStatus = 'waiting' | 'playing' | 'results';
export type VotingType = 'secret' | 'open';

export interface BaseGame {
  id: string;
  name: string;
  description: string;
  suit: GameSuit;
  difficulty: number;
  timeLimit: number;
  card: string;
}

export interface HeartsGame extends BaseGame {
  mechanic: 'vote_elimination' | 'prisoners_dilemma' | 'majority_vote';
  rounds: number;
  votingType: VotingType;
  parameters?: {
    targetPlayer?: string;
    revealed?: boolean;
  };
}

export interface ClubsGame extends BaseGame {
  mechanic: 'collaborative_riddles' | 'sequential_collaboration' | 'distributed_memory';
  riddles?: number;
  discussionTime?: number;
  targetLength?: number;
  sequenceLength?: number;
  parameters?: {
    currentRiddle?: number;
    sharedAnswer?: string;
    sequence?: string[];
  };
}

export interface DiamondsGame extends BaseGame {
  mechanic: 'speed_math' | 'pattern_recognition' | 'boolean_logic';
  problems?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'dynamic';
  attempts?: number;
  complexity?: 'low' | 'medium' | 'high';
  parameters?: {
    currentProblem?: number;
    currentPlayer?: string;
    turnOrder?: string[];
  };
}

export interface SpadesGame extends BaseGame {
  mechanic: 'timed_questions' | 'physical_challenges' | 'last_standing';
  questionsPerPlayer?: number;
  timePerQuestion?: number;
  challenges?: number;
  checkInterval?: number;
  parameters?: {
    currentChallenge?: number;
    completions?: Record<string, boolean>;
  };
}

export type Game = HeartsGame | ClubsGame | DiamondsGame | SpadesGame;

export interface Player {
  id: string;
  room_id: string;
  user_id: string;
  name: string;
  alive: boolean;
  cards: number;
  connected: boolean;
  last_seen: string;
  created_at: string;
}

export interface Room {
  id: string;
  code: string;
  host_id: string;
  status: RoomStatus;
  created_at: string;
  current_game: Game | null;
  game_history: Game[];
}

export interface GameState {
  id: string;
  room_id: string;
  timer: number;
  round: number;
  votes: Record<string, string> | null;
  answers: Record<string, any> | null;
  current_turn: string | null;
  updated_at: string;
}

