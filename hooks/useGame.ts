'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GameState } from '@/types/game'

export function useGame(roomId: string | null) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchGameState = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('game_state')
          .select('*')
          .eq('room_id', roomId)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is ok if game hasn't started
          throw fetchError
        }

        setGameState(data as GameState | null)
        setError(null)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGameState()

    // Subscribe to game state changes
    const gameSubscription = supabase
      .channel(`game_state:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_state',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setGameState(payload.new as GameState)
          } else if (payload.eventType === 'DELETE') {
            setGameState(null)
          }
        }
      )
      .subscribe()

    return () => {
      gameSubscription.unsubscribe()
    }
  }, [roomId, supabase])

  const updateGameState = async (updates: Partial<GameState>) => {
    if (!roomId) return { success: false, error: 'No room ID' }

    try {
      const { error: updateError } = await supabase
        .from('game_state')
        .update(updates)
        .eq('room_id', roomId)

      if (updateError) throw updateError

      return { success: true, error: null }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const submitVote = async (playerId: string, vote: string) => {
    if (!gameState) return { success: false, error: 'No game state' }

    const votes = (gameState.votes as Record<string, string>) || {}
    votes[playerId] = vote

    return updateGameState({ votes })
  }

  const submitAnswer = async (playerId: string, answer: any) => {
    if (!gameState) return { success: false, error: 'No game state' }

    const answers = (gameState.answers as Record<string, any>) || {}
    answers[playerId] = answer

    return updateGameState({ answers })
  }

  const updateTimer = async (timer: number) => {
    return updateGameState({ timer })
  }

  const nextRound = async () => {
    if (!gameState) return { success: false, error: 'No game state' }

    return updateGameState({
      round: gameState.round + 1,
      votes: {},
      answers: {},
    })
  }

  return {
    gameState,
    loading,
    error,
    updateGameState,
    submitVote,
    submitAnswer,
    updateTimer,
    nextRound,
  }
}

