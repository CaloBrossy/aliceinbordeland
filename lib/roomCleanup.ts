import { createClient } from '@/lib/supabase/client'

// Clean up disconnected players and empty rooms
export async function cleanupRooms() {
  const supabase = createClient()
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  // Mark players as disconnected if they haven't been seen in 30 seconds
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString()

  // Update disconnected players
  await supabase
    .from('players')
    .update({ connected: false })
    .lt('last_seen', thirtySecondsAgo)
    .eq('connected', true)

  // Get rooms with no connected players
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, created_at, status')

  if (!rooms) return

  for (const room of rooms) {
    const { data: connectedPlayers } = await supabase
      .from('players')
      .select('id')
      .eq('room_id', room.id)
      .eq('connected', true)

    // Delete room if no connected players and it's been more than 5 minutes
    if ((!connectedPlayers || connectedPlayers.length === 0) && room.status === 'waiting') {
      const roomAge = new Date(room.created_at).getTime()
      const now = Date.now()

      if (now - roomAge > 5 * 60 * 1000) {
        await supabase.from('rooms').delete().eq('id', room.id)
      }
    }
  }
}

// Check and promote new host if current host is disconnected
export async function checkAndPromoteHost(roomId: string) {
  const supabase = createClient()

  const { data: room } = await supabase
    .from('rooms')
    .select('host_id')
    .eq('id', roomId)
    .single()

  if (!room) return

  const { data: hostPlayer } = await supabase
    .from('players')
    .select('connected')
    .eq('room_id', roomId)
    .eq('user_id', room.host_id)
    .single()

  // If host is disconnected, promote new host
  if (hostPlayer && !hostPlayer.connected) {
    const { data: connectedPlayers } = await supabase
      .from('players')
      .select('user_id')
      .eq('room_id', roomId)
      .eq('connected', true)
      .order('created_at', { ascending: true })
      .limit(1)

    if (connectedPlayers && connectedPlayers.length > 0) {
      await supabase
        .from('rooms')
        .update({ host_id: connectedPlayers[0].user_id })
        .eq('id', roomId)
    }
  }
}

