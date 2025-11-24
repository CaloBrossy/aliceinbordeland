-- ============================================
-- Fix RLS Policies - Ejecuta este script
-- ============================================
-- Este script corrige las políticas RLS que están causando errores 500

-- Step 1: Drop existing problematic policies
DROP POLICY IF EXISTS "Players can read players in their room" ON players;
DROP POLICY IF EXISTS "Players can read game state in their room" ON game_state;

-- Step 2: Create simpler, working policies for players
-- Allow any authenticated user (including anonymous) to read players
-- The app logic will handle filtering by room_id
CREATE POLICY "Authenticated users can read players" ON players
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Step 3: Fix game_state policy to be simpler
-- Allow any authenticated user to read game_state
CREATE POLICY "Authenticated users can read game state" ON game_state
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Step 4: Also allow players to read their own data more easily
-- This is a backup policy in case the first one doesn't work
CREATE POLICY "Users can read their own player data" ON players
  FOR SELECT
  USING (user_id = auth.uid()::text::uuid OR user_id::text = auth.uid()::text);

