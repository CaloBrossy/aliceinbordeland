-- ============================================
-- FIX ALL ISSUES - Ejecuta este script completo
-- ============================================
-- Este script corrige todos los problemas actuales:
-- 1. Agrega la columna created_at a players
-- 2. Corrige las políticas RLS que causan errores 500

-- Step 1: Add created_at column to players (if missing)
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have a default created_at value
UPDATE players 
SET created_at = COALESCE(created_at, NOW())
WHERE created_at IS NULL;

-- Step 2: Drop existing problematic policies
DROP POLICY IF EXISTS "Players can read players in their room" ON players;
DROP POLICY IF EXISTS "Players can read game state in their room" ON game_state;
DROP POLICY IF EXISTS "Authenticated users can read players" ON players;
DROP POLICY IF EXISTS "Authenticated users can read game state" ON game_state;

-- Step 3: Create simpler, working policies for players
-- Allow any authenticated user (including anonymous) to read players
-- The app logic will handle filtering by room_id
CREATE POLICY "Authenticated users can read players" ON players
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Step 4: Fix game_state policy to be simpler
-- Allow any authenticated user to read game_state
CREATE POLICY "Authenticated users can read game state" ON game_state
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ============================================
-- ¡Listo! Todos los problemas están corregidos.
-- Recarga tu aplicación y los errores deberían desaparecer.
-- ============================================

