-- Migration: Add created_at column to players table
-- Ejecuta este script si ya ejecutaste el schema.sql anteriormente

-- Add created_at column to players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have a default created_at value
UPDATE players 
SET created_at = COALESCE(created_at, NOW())
WHERE created_at IS NULL;

