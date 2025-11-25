'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Room, Player } from '@/types/game'
import { checkAndPromoteHost } from '@/lib/roomCleanup'

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const hostCheckRef = useRef<NodeJS.Timeout | null>(null)
  const lastHostCheckRef = useRef<number>(0)
  const playersUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()

    // Periodic host check (less frequent to avoid loops)
    if (hostCheckRef.current) {
      clearInterval(hostCheckRef.current)
    }
    hostCheckRef.current = setInterval(() => {
      const now = Date.now()
      // Only check if at least 30 seconds have passed since last check
      if (now - lastHostCheckRef.current > 30000) {
        lastHostCheckRef.current = now
        checkAndPromoteHost(roomId).catch(() => {
          // Silently fail to avoid loops
        })
      }
    }, 30000) // Check every 30 seconds

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
        () => {
          // Debounce player updates to avoid rapid refetches
          if (playersUpdateTimeoutRef.current) {
            clearTimeout(playersUpdateTimeoutRef.current)
          }
          playersUpdateTimeoutRef.current = setTimeout(async () => {
            // Refetch players on any change
            const { data: playersData } = await supabase
              .from('players')
              .select('*')
              .eq('room_id', roomId)
              .order('created_at', { ascending: true })

            if (playersData) {
              setPlayers(playersData as Player[])
            }
          }, 500) // Wait 500ms before refetching
        }
      )
      .subscribe()

    return () => {
      if (hostCheckRef.current) {
        clearInterval(hostCheckRef.current)
      }
      if (playersUpdateTimeoutRef.current) {
        clearTimeout(playersUpdateTimeoutRef.current)
      }
      roomSubscription.unsubscribe()
      playersSubscription.unsubscribe()
    }
  }, [roomId, supabase])

  return { room, players, loading, error }
}

