'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createRoom, joinRoom } from '@/lib/roomManager'
import { Copy, Users, LogIn } from 'lucide-react'

export default function Home() {
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const router = useRouter()
  const { user, signInAnonymously } = useAuth()

  const handleCreateRoom = async () => {
    if (!user) {
      const { error } = await signInAnonymously()
      if (error) {
        if (error.message?.includes('anonymous_provider_disabled') || error.message?.includes('disabled')) {
          setError('La autenticación anónima está deshabilitada. Por favor, habilítala en Supabase Dashboard > Authentication > Providers > Anonymous')
        } else {
          setError('Error al autenticar. Intenta de nuevo.')
        }
        return
      }
      // Wait for user to be set
      setTimeout(() => handleCreateRoom(), 100)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createRoom(user.id)
      if (result.error) {
        setError(result.error.message)
        setLoading(false)
        return
      }

      router.push(`/room/${result.code}`)
    } catch (err: any) {
      setError(err.message || 'Error al crear la sala')
      setLoading(false)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomCode.trim()) {
      setError('Ingresa un código de sala')
      return
    }

    if (!user) {
      const { error } = await signInAnonymously()
      if (error) {
        if (error.message?.includes('anonymous_provider_disabled') || error.message?.includes('disabled')) {
          setError('La autenticación anónima está deshabilitada. Por favor, habilítala en Supabase Dashboard > Authentication > Providers > Anonymous')
        } else {
          setError('Error al autenticar. Intenta de nuevo.')
        }
        return
      }
      // Wait for user to be set
      setTimeout(() => handleJoinRoom(e), 100)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await joinRoom(roomCode.toUpperCase().trim(), user.id, playerName.trim() || 'Jugador')
      if (!result.success) {
        setError(result.error || 'Error al unirse a la sala')
        setLoading(false)
        return
      }

      router.push(`/room/${roomCode.toUpperCase().trim()}`)
    } catch (err: any) {
      setError(err.message || 'Error al unirse a la sala')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Alice in Borderland</h1>
          <p className="text-gray-400">Juego Multijugador en Tiempo Real</p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-lg p-8 space-y-6">
          {!showJoinForm ? (
            <>
              {/* Create Room Button */}
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando sala...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Crear Sala
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1a1a1a] text-gray-400">o</span>
                </div>
              </div>

              {/* Join Room Button */}
              <button
                onClick={() => setShowJoinForm(true)}
                className="w-full py-4 px-6 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Unirse a Sala
              </button>
            </>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Código de Sala
                </label>
                <input
                  id="roomCode"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-red-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
                  Tu Nombre (opcional)
                </label>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Jugador"
                  maxLength={50}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false)
                    setRoomCode('')
                    setPlayerName('')
                    setError(null)
                  }}
                  className="flex-1 py-3 px-4 border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !roomCode.trim()}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uniéndose...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Unirse
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Invita a tus amigos usando el código de sala</p>
          <p>Máximo 10 jugadores por sala</p>
        </div>
      </div>
    </div>
  )
}

