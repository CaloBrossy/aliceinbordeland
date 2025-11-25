-- ============================================
-- Fix RLS Policies for Test Players
-- ============================================
-- Este script permite que el host pueda insertar jugadores de prueba

-- Step 1: Drop existing INSERT policy for players
DROP POLICY IF EXISTS "Anyone can join as player" ON players;

-- Step 2: Create new INSERT policy that allows:
-- 1. Users to insert themselves (normal flow)
-- 2. Host to insert players in their room (for test players/bots)
CREATE POLICY "Anyone can join as player" ON players
  FOR INSERT
  WITH CHECK (
    -- User can insert themselves
    user_id = auth.uid()::text::uuid OR user_id::text = auth.uid()::text
    OR
    -- Host can insert players in their room (for test players)
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = players.room_id
      AND (r.host_id = auth.uid()::text::uuid OR r.host_id::text = auth.uid()::text)
    )
  );

-- ============================================
-- ¡Listo! Ahora el host puede crear jugadores de prueba.
-- ============================================

