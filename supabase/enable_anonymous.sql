-- Enable Anonymous Authentication Provider
-- Run this in Supabase SQL Editor after enabling the provider in the dashboard

-- Note: This query verifies if anonymous auth is enabled
-- The actual enabling must be done from the Supabase Dashboard
-- Go to: Authentication > Providers > Anonymous > Enable

-- This is just a verification query
SELECT 
  id,
  provider,
  enabled,
  settings
FROM auth.providers
WHERE provider = 'anonymous';

-- If you see a row with provider='anonymous' and enabled=false,
-- you need to enable it from the dashboard first.

