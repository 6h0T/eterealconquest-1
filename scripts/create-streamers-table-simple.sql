-- Crear la tabla de streamers
CREATE TABLE IF NOT EXISTS streamers (
  id SERIAL PRIMARY KEY,
  streamer_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  channel_url TEXT NOT NULL,
  is_live BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  thumbnail_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permitir acceso público a la tabla (desactivar RLS)
ALTER TABLE streamers DISABLE ROW LEVEL SECURITY;
