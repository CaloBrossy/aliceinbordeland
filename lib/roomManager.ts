import { createClient } from '@/lib/supabase/client'
import type { Room, Player } from '@/types/game'
import { generateRandomGame } from './gameGenerator'

const MAX_PLAYERS = 10

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createRoom(userId: string): Promise<{ room: Room; code: string; error: null } | { room: null; code: null; error: Error }> {
  const supabase = createClient()
  
  let attempts = 0
  let code: string
  let roomExists = true

  // Generate unique code (max 10 attempts)
  while (roomExists && attempts < 10) {
    code = generateRoomCode()
    const { data } = await supabase
      .from('rooms')
      .select('code')
      .eq('code', code)
      .single()
    
    if (!data) {
      roomExists = false
    } else {
      attempts++
    }
  }

  if (attempts >= 10) {
    return {
      room: null,
      code: null,
      error: new Error('No se pudo generar un código único'),
    }
  }

  const { data: room, error } = await supabase
    .from('rooms')
    .insert({
      code: code!,
      host_id: userId,
      status: 'waiting',
      game_history: [],
    })
    .select()
    .single()

  if (error) {
    return { room: null, code: null, error }
  }

  // Add host as first player
  const { error: playerError } = await supabase
    .from('players')
    .insert({
      room_id: room.id,
      user_id: userId,
      name: 'Host',
      alive: true,
      cards: 0,
      connected: true,
    })

  if (playerError) {
    // Clean up room if player creation fails
    await supabase.from('rooms').delete().eq('id', room.id)
    return { room: null, code: null, error: playerError }
  }

  return { room: room as Room, code: code!, error: null }
}

export async function joinRoom(
  code: string,
  userId: string,
  playerName: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

  // Get room by code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (roomError || !room) {
    return { success: false, error: 'Sala no encontrada' }
  }

  // Check if room is full
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id')
    .eq('room_id', room.id)

  if (playersError) {
    return { success: false, error: 'Error al verificar jugadores' }
  }

  if (players && players.length >= MAX_PLAYERS) {
    return { success: false, error: 'Sala llena (máximo 10 jugadores)' }
  }

  // Check if game already started
  if (room.status === 'playing') {
    return { success: false, error: 'El juego ya ha comenzado' }
  }

  // Check if player already in room
  const { data: existingPlayer } = await supabase
    .from('players')
    .select('id')
    .eq('room_id', room.id)
    .eq('user_id', userId)
    .single()

  if (existingPlayer) {
    // Update player connection status
    await supabase
      .from('players')
      .update({ connected: true, last_seen: new Date().toISOString() })
      .eq('id', existingPlayer.id)
    return { success: true, error: null }
  }

  // Add player to room
  const { error: insertError } = await supabase
    .from('players')
    .insert({
      room_id: room.id,
      user_id: userId,
      name: playerName.trim() || 'Jugador',
      alive: true,
      cards: 0,
      connected: true,
    })

  if (insertError) {
    return { success: false, error: 'Error al unirse a la sala' }
  }

  return { success: true, error: null }
}

export async function leaveRoom(roomId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

  // Get room to check if user is host
  const { data: room } = await supabase
    .from('rooms')
    .select('host_id, status')
    .eq('id', roomId)
    .single()

  if (!room) {
    return { success: false, error: 'Sala no encontrada' }
  }

  // If host is leaving and game is not playing, delete room
  if (room.host_id === userId && room.status === 'waiting') {
    const { error } = await supabase.from('rooms').delete().eq('id', roomId)
    if (error) {
      return { success: false, error: 'Error al eliminar la sala' }
    }
    return { success: true, error: null }
  }

  // Otherwise, just remove player
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId)

  if (error) {
    return { success: false, error: 'Error al salir de la sala' }
  }

  // If host left during game, promote new host
  if (room.host_id === userId && room.status !== 'waiting') {
    await promoteNewHost(roomId)
  }

  return { success: true, error: null }
}

export async function promoteNewHost(roomId: string): Promise<void> {
  const supabase = createClient()

  // Get first connected player
  const { data: players } = await supabase
    .from('players')
    .select('user_id')
    .eq('room_id', roomId)
    .eq('connected', true)
    .order('created_at', { ascending: true })
    .limit(1)

  if (players && players.length > 0) {
    await supabase
      .from('rooms')
      .update({ host_id: players[0].user_id })
      .eq('id', roomId)
  }
}

export async function startGame(
  roomId: string,
  userId: string,
  selectedGame?: { id: string; suit: 'hearts' | 'clubs' | 'diamonds' | 'spades' }
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

  // Verify user is host
  const { data: room } = await supabase
    .from('rooms')
    .select('host_id, game_history')
    .eq('id', roomId)
    .single()

  if (!room || room.host_id !== userId) {
    return { success: false, error: 'Solo el host puede iniciar el juego' }
  }

  // Get players
  const { data: players } = await supabase
    .from('players')
    .select('id, user_id')
    .eq('room_id', roomId)
    .eq('connected', true)

  // Allow testing with 1 player (host only), but recommend 2+ for proper gameplay
  if (!players || players.length < 1) {
    return { success: false, error: 'Se necesita al menos 1 jugador' }
  }
  
  if (players.length < 2) {
    console.warn('Testing mode: Starting game with only 1 player')
  }

  // Generate game
  const previousGames = (room.game_history as any[])?.map((g: any) => g.id) || []
  const game = selectedGame
    ? await import('./gameGenerator').then((m) =>
        m.generateSpecificGame(selectedGame.id, selectedGame.suit, players, undefined)
      )
    : generateRandomGame(players, previousGames)

  if (!game) {
    return { success: false, error: 'Error al generar el juego' }
  }

  // Update room
  const { error: roomError } = await supabase
    .from('rooms')
    .update({
      status: 'playing',
      current_game: game,
    })
    .eq('id', roomId)

  if (roomError) {
    return { success: false, error: 'Error al iniciar el juego' }
  }

  // Initialize game state
  const { error: stateError } = await supabase
    .from('game_state')
    .upsert({
      room_id: roomId,
      timer: game.timeLimit,
      round: 1,
      votes: {},
      answers: {},
      current_turn: null,
    })

  if (stateError) {
    return { success: false, error: 'Error al inicializar el estado del juego' }
  }

  return { success: true, error: null }
}

export async function endGame(roomId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

  // Verify user is host
  const { data: room } = await supabase
    .from('rooms')
    .select('host_id, current_game, game_history')
    .eq('id', roomId)
    .single()

  if (!room || room.host_id !== userId) {
    return { success: false, error: 'Solo el host puede terminar el juego' }
  }

  // Add current game to history
  const gameHistory = (room.game_history as any[]) || []
  if (room.current_game) {
    gameHistory.push(room.current_game)
  }

  // Update room status
  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'results',
      game_history: gameHistory,
    })
    .eq('id', roomId)

  if (error) {
    return { success: false, error: 'Error al terminar el juego' }
  }

  return { success: true, error: null }
}

export async function nextGame(roomId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

  // Verify user is host
  const { data: room } = await supabase
    .from('rooms')
    .select('host_id')
    .eq('id', roomId)
    .single()

  if (!room || room.host_id !== userId) {
    return { success: false, error: 'Solo el host puede iniciar el siguiente juego' }
  }

  // Update room back to playing and generate new game
  return startGame(roomId, userId)
}

export async function updatePlayerConnection(roomId: string, userId: string, connected: boolean): Promise<void> {
  const supabase = createClient()

  await supabase
    .from('players')
    .update({
      connected,
      last_seen: new Date().toISOString(),
    })
    .eq('room_id', roomId)
    .eq('user_id', userId)
}

// Helper function to create test/bot players for testing
export async function createTestPlayers(roomId: string, count: number = 2): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient()

  try {
    // Check current player count
    const { data: currentPlayers } = await supabase
      .from('players')
      .select('id')
      .eq('room_id', roomId)

    const currentCount = currentPlayers?.length || 0
    const totalAfter = currentCount + count

    if (totalAfter > MAX_PLAYERS) {
      return { success: false, error: `No puedes agregar ${count} jugadores. Máximo permitido: ${MAX_PLAYERS}` }
    }

    // Generate test player names
    const testNames = ['Bot Alice', 'Bot Bob', 'Bot Charlie', 'Bot Diana', 'Bot Eve', 'Bot Frank', 'Bot Grace', 'Bot Henry']
    
    // Helper function to generate a valid UUID v4
    function generateUUID(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    
    // Create test players with valid UUID user_ids
    const testPlayers = []
    for (let i = 0; i < count; i++) {
      testPlayers.push({
        room_id: roomId,
        user_id: generateUUID(),
        name: testNames[i] || `Bot ${i + 1}`,
        alive: true,
        cards: 0,
        connected: true,
      })
    }

    const { error } = await supabase
      .from('players')
      .insert(testPlayers)

    if (error) {
      return { success: false, error: 'Error al crear jugadores de prueba' }
    }

    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear jugadores de prueba' }
  }
}

