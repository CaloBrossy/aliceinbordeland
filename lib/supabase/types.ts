export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          code: string
          host_id: string
          status: 'waiting' | 'playing' | 'results'
          created_at: string
          current_game: Json | null
          game_history: Json[]
        }
        Insert: {
          id?: string
          code: string
          host_id: string
          status?: 'waiting' | 'playing' | 'results'
          created_at?: string
          current_game?: Json | null
          game_history?: Json[]
        }
        Update: {
          id?: string
          code?: string
          host_id?: string
          status?: 'waiting' | 'playing' | 'results'
          created_at?: string
          current_game?: Json | null
          game_history?: Json[]
        }
      }
      players: {
        Row: {
          id: string
          room_id: string
          user_id: string
          name: string
          alive: boolean
          cards: number
          connected: boolean
          last_seen: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          name: string
          alive?: boolean
          cards?: number
          connected?: boolean
          last_seen?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          name?: string
          alive?: boolean
          cards?: number
          connected?: boolean
          last_seen?: string
        }
      }
      game_state: {
        Row: {
          id: string
          room_id: string
          timer: number
          round: number
          votes: Json | null
          answers: Json | null
          current_turn: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          timer: number
          round?: number
          votes?: Json | null
          answers?: Json | null
          current_turn?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          timer?: number
          round?: number
          votes?: Json | null
          answers?: Json | null
          current_turn?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

