'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Room, Player } from '@/types/game'
import { checkAndPromoteHost } from '@/lib/roomCleanup'

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!roomId) {
      setLoading(false)
      return
    }

    // Initial fetch
    const fetchRoom = async () => {
      try {
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single()

        if (roomError) throw roomError

        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true })

        if (playersError) throw playersError

        setRoom(roomData as Room)
        setPlayers((playersData as Player[]) || [])
        setError(null)

        // Check and promote host if needed
        await checkAndPromoteHost(roomId)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()

    // Periodic host check
    const hostCheckInterval = setInterval(() => {
      if (roomId) {
        checkAndPromoteHost(roomId)
      }
    }, 10000) // Check every 10 seconds

    // Subscribe to room changes
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setRoom(payload.new as Room)
          } else if (payload.eventType === 'DELETE') {
            setRoom(null)
          }
        }
      )
      .subscribe()

    // Subscribe to players changes
    const playersSubscription = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          // Refetch players on any change
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true })

          if (playersData) {
            setPlayers(playersData as Player[])
          }

          // Check host after player changes
          await checkAndPromoteHost(roomId)
        }
      )
      .subscribe()

    return () => {
      clearInterval(hostCheckInterval)
      roomSubscription.unsubscribe()
      playersSubscription.unsubscribe()
    }
  }, [roomId, supabase])

  return { room, players, loading, error }
}

