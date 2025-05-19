-- Primero, crear la función de trigger para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Luego, crear un procedimiento almacenado para crear la tabla de streamers
CREATE OR REPLACE FUNCTION create_streamers_table()
RETURNS VOID AS $$
BEGIN
  -- Crear la tabla de streamers si no existe
  CREATE TABLE IF NOT EXISTS streamers (
    id SERIAL PRIMARY KEY,
    streamer_name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('twitch', 'kick', 'facebook', 'youtube')),
    channel_url TEXT NOT NULL,
    is_live BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    thumbnail_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  -- Eliminar el trigger si ya existe
  DROP TRIGGER IF EXISTS set_streamers_updated_at ON streamers;

  -- Crear el trigger
  CREATE TRIGGER set_streamers_updated_at
  BEFORE UPDATE ON streamers
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

  -- Configurar políticas de seguridad (RLS)
  -- Habilitar RLS en la tabla
  ALTER TABLE streamers ENABLE ROW LEVEL SECURITY;

  -- Eliminar políticas existentes
  DROP POLICY IF EXISTS "Permitir lectura pública de streamers" ON streamers;
  DROP POLICY IF EXISTS "Permitir escritura de streamers para usuarios autenticados" ON streamers;

  -- Crear políticas
  CREATE POLICY "Permitir lectura pública de streamers"
    ON streamers
    FOR SELECT
    USING (true);

  CREATE POLICY "Permitir escritura de streamers para usuarios autenticados"
    ON streamers
    FOR ALL
    USING (true);
END;
$$ LANGUAGE plpgsql;
