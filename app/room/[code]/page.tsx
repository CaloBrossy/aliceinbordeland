'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRoom } from '@/hooks/useRoom'
import Lobby from '@/components/Lobby'
import GameScreen from '@/components/GameScreen'
import ResultScreen from '@/components/ResultScreen'
import type { Room } from '@/types/game'

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const [roomId, setRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRoom = async (retries = 5) => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('id')
          .eq('code', code.toUpperCase())
          .single()

        if (error || !data) {
          // Si hay error y aún quedan reintentos, esperar un poco y reintentar
          // Esto es útil cuando se acaba de crear la sala y hay un delay en la propagación
          if (retries > 0 && (error?.code === 'PGRST116' || error?.message?.includes('0 rows'))) {
            setTimeout(() => {
              fetchRoom(retries - 1)
            }, 500)
            return
          }
          // Si no hay más reintentos o es otro error, redirigir
          router.push('/')
          return
        }

        setRoomId(data.id)
        setLoading(false)
      } catch (err) {
        // Si hay error y aún quedan reintentos, esperar un poco y reintentar
        if (retries > 0) {
          setTimeout(() => {
            fetchRoom(retries - 1)
          }, 500)
          return
        }
        router.push('/')
        setLoading(false)
      }
    }

    if (code) {
      fetchRoom()
    }
  }, [code, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando sala...</p>
        </div>
      </div>
    )
  }

  if (!roomId) {
    return null
  }

  return <RoomContent roomId={roomId} roomCode={code.toUpperCase()} />
}

function RoomContent({ roomId, roomCode }: { roomId: string; roomCode: string }) {
  const { room } = useRoom(roomId)

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-red-400 mb-4">Sala no encontrada</p>
        </div>
      </div>
    )
  }

  switch (room.status) {
    case 'waiting':
      return <Lobby roomId={roomId} roomCode={roomCode} />
    case 'playing':
      return <GameScreen roomId={roomId} roomCode={roomCode} />
    case 'results':
      return <ResultScreen roomId={roomId} roomCode={roomCode} />
    default:
      return <Lobby roomId={roomId} roomCode={roomCode} />
  }
}

