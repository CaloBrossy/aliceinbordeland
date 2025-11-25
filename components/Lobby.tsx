'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRoom } from '@/hooks/useRoom'
import { startGame, leaveRoom, updatePlayerConnection, createTestPlayers } from '@/lib/roomManager'
import { Copy, Check, Users, Play, LogOut, Wifi, WifiOff, UserPlus } from 'lucide-react'

interface LobbyProps {
  roomId: string
  roomCode: string
}

export default function Lobby({ roomId, roomCode }: LobbyProps) {
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)
  const [addingBots, setAddingBots] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { room, players, loading } = useRoom(roomId)

  const isHost = room?.host_id === user?.id

  // Update connection status (debounced to avoid loops)
  useEffect(() => {
    if (!user || !roomId) return

    let connectionUpdateTimeout: NodeJS.Timeout | null = null
    let heartbeatInterval: NodeJS.Timeout | null = null

    // Initial connection update
    const updateConnection = async () => {
      try {
        await updatePlayerConnection(roomId, user.id, true)
      } catch (err) {
        // Silently fail to avoid loops
      }
    }

    // Update connection with debounce
    const debouncedUpdate = () => {
      if (connectionUpdateTimeout) {
        clearTimeout(connectionUpdateTimeout)
      }
      connectionUpdateTimeout = setTimeout(updateConnection, 500)
    }

    // Initial update
    updateConnection()

    // Heartbeat: update connection every 10 seconds
    heartbeatInterval = setInterval(() => {
      updateConnection()
    }, 10000)

    // Update on visibility change
    const handleVisibilityChange = () => {
      debouncedUpdate()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (connectionUpdateTimeout) {
        clearTimeout(connectionUpdateTimeout)
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
      }
      updatePlayerConnection(roomId, user.id, false).catch(() => {
        // Silently fail on cleanup
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, roomId])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('No se pudo copiar el código')
    }
  }

  const handleStartGame = async () => {
    if (!user || !isHost) return

    setStarting(true)
    setError(null)

    try {
      const result = await startGame(roomId, user.id)
      if (!result.success) {
        setError(result.error || 'Error al iniciar el juego')
        setStarting(false)
        return
      }
      // Navigation will happen automatically via useRoom hook detecting status change
    } catch (err: any) {
      setError(err.message || 'Error al iniciar el juego')
      setStarting(false)
    }
  }

  const handleLeave = async () => {
    if (!user) return

    const result = await leaveRoom(roomId, user.id)
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'Error al salir de la sala')
    }
  }

  const handleAddTestPlayers = async () => {
    if (!isHost) return

    setAddingBots(true)
    setError(null)

    try {
      // Add 2 test players
      const result = await createTestPlayers(roomId, 2)
      if (!result.success) {
        setError(result.error || 'Error al agregar jugadores de prueba')
      }
    } catch (err: any) {
      setError(err.message || 'Error al agregar jugadores de prueba')
    } finally {
      setAddingBots(false)
    }
  }

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

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-red-400 mb-4">Sala no encontrada</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const connectedPlayers = players.filter((p) => p.connected)
  const canStart = isHost && connectedPlayers.length >= 1

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0a0a0a]">
      <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Sala de Espera</h1>
          <button
            onClick={handleLeave}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors text-base sm:text-lg"
          >
            <LogOut className="w-5 h-5" />
            Salir
          </button>
        </div>

        {/* Room Code Card */}
        <div className="glass rounded-lg p-6 sm:p-8">
          <div className="text-center space-y-4 sm:space-y-5">
            <p className="text-sm sm:text-base text-gray-400">Código de Sala</p>
            <div className="flex items-center justify-center gap-4 sm:gap-5">
              <div className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-white tracking-widest">
                {roomCode}
              </div>
              <button
                onClick={copyCode}
                className="p-3 sm:p-4 bg-[#0a0a0a] border border-red-600 rounded-lg hover:bg-red-600 transition-colors"
                title="Copiar código"
              >
                {copied ? (
                  <Check className="w-6 h-6 text-green-500" />
                ) : (
                  <Copy className="w-6 h-6 text-red-600" />
                )}
              </button>
            </div>
            <p className="text-sm sm:text-base text-gray-500">
              Comparte este código con tus amigos para que se unan
            </p>
          </div>
        </div>

        {/* Players List */}
        <div className="glass rounded-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              Jugadores ({connectedPlayers.length}/{players.length})
            </h2>
            {isHost && (
              <span className="px-4 py-1.5 bg-red-600/20 border border-red-600 text-red-400 text-sm sm:text-base rounded-full">
                Host
              </span>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 sm:p-5 rounded-lg ${
                  player.user_id === user?.id
                    ? 'bg-red-600/20 border border-red-600'
                    : 'bg-[#0a0a0a] border border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {player.connected ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="text-base sm:text-lg text-white font-medium">
                    {player.name}
                    {player.user_id === user?.id && ' (Tú)'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {player.user_id === room.host_id && (
                    <span className="px-3 py-1 bg-red-600 text-white text-sm rounded">Host</span>
                  )}
                  <span className="text-sm sm:text-base text-gray-400">
                    {player.cards} {player.cards === 1 ? 'carta' : 'cartas'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Test Players Button (Host only) */}
        {isHost && connectedPlayers.length < 3 && (
          <div className="glass rounded-lg p-5 sm:p-6">
            <button
              onClick={handleAddTestPlayers}
              disabled={addingBots}
              className="w-full py-3.5 sm:py-4 px-5 sm:px-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              {addingBots ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Agregar 2 Jugadores de Prueba
                </>
              )}
            </button>
            <p className="text-center text-sm sm:text-base text-gray-500 mt-3">
              (Para testing - se agregarán bots automáticamente)
            </p>
          </div>
        )}

        {/* Start Game Button (Host only) */}
        {isHost && (
          <div className="glass rounded-lg p-6 sm:p-8">
            <button
              onClick={handleStartGame}
              disabled={!canStart || starting}
              className="w-full py-4 sm:py-5 px-6 sm:px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg sm:text-xl"
            >
              {starting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Iniciando juego...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Iniciar Juego
                </>
              )}
            </button>
            {!canStart && connectedPlayers.length < 1 && (
              <p className="text-center text-sm sm:text-base text-gray-400 mt-3">
                Se necesita al menos 1 jugador para iniciar
              </p>
            )}
            {connectedPlayers.length === 1 && (
              <p className="text-center text-sm sm:text-base text-yellow-400 mt-3">
                ⚠️ Modo testing: Iniciando con 1 jugador (se recomienda 2+ para mejor experiencia)
              </p>
            )}
          </div>
        )}

        {/* Waiting Message (Non-host) */}
        {!isHost && (
          <div className="glass rounded-lg p-6 sm:p-8 text-center">
            <p className="text-base sm:text-lg text-gray-400">
              Esperando a que el host inicie el juego...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 sm:p-5 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm sm:text-base">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

