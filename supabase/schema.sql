-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'results')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_game JSONB,
  game_history JSONB DEFAULT '[]'::JSONB
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name VARCHAR(50) NOT NULL,
  alive BOOLEAN DEFAULT true,
  cards INTEGER DEFAULT 0,
  connected BOOLEAN DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create game_state table
CREATE TABLE IF NOT EXISTS game_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  timer INTEGER DEFAULT 0,
  round INTEGER DEFAULT 1,
  votes JSONB,
  answers JSONB,
  current_turn UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_game_state_room_id ON game_state(room_id);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
-- Anyone can read rooms (to check if they exist)
CREATE POLICY "Anyone can read rooms" ON rooms
  FOR SELECT
  USING (true);

-- Only authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Only host can update their room
CREATE POLICY "Host can update their room" ON rooms
  FOR UPDATE
  USING (host_id = auth.uid()::text::uuid OR host_id::text = auth.uid()::text);

-- Host can delete their room
CREATE POLICY "Host can delete their room" ON rooms
  FOR DELETE
  USING (host_id = auth.uid()::text::uuid OR host_id::text = auth.uid()::text);

-- RLS Policies for players
-- Players in a room can read all players in that room
CREATE POLICY "Players can read players in their room" ON players
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.room_id = players.room_id
      AND (p.user_id = auth.uid()::text::uuid OR p.user_id::text = auth.uid()::text)
    )
  );

-- Anyone can insert themselves as a player
CREATE POLICY "Anyone can join as player" ON players
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text::uuid OR user_id::text = auth.uid()::text);

-- Players can update themselves
CREATE POLICY "Players can update themselves" ON players
  FOR UPDATE
  USING (user_id = auth.uid()::text::uuid OR user_id::text = auth.uid()::text);

-- Players can delete themselves (leave room)
CREATE POLICY "Players can leave room" ON players
  FOR DELETE
  USING (user_id = auth.uid()::text::uuid OR user_id::text = auth.uid()::text);

-- Host can update any player in their room
CREATE POLICY "Host can update players in their room" ON players
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = players.room_id
      AND (r.host_id = auth.uid()::text::uuid OR r.host_id::text = auth.uid()::text)
    )
  );

-- RLS Policies for game_state
-- Players in a room can read game state
CREATE POLICY "Players can read game state in their room" ON game_state
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.room_id = game_state.room_id
      AND (p.user_id = auth.uid()::text::uuid OR p.user_id::text = auth.uid()::text)
    )
  );

-- Host can insert/update game state
CREATE POLICY "Host can manage game state" ON game_state
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = game_state.room_id
      AND (r.host_id = auth.uid()::text::uuid OR r.host_id::text = auth.uid()::text)
    )
  );

-- Function to update last_seen timestamp
CREATE OR REPLACE FUNCTION update_player_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_seen on player updates
CREATE TRIGGER update_player_last_seen_trigger
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_player_last_seen();

-- Function to update game_state updated_at
CREATE OR REPLACE FUNCTION update_game_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on game_state updates
CREATE TRIGGER update_game_state_timestamp_trigger
  BEFORE UPDATE ON game_state
  FOR EACH ROW
  EXECUTE FUNCTION update_game_state_timestamp();

