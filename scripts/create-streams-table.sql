CREATE TABLE IF NOT EXISTS streams (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_live BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS pero permitir acceso completo
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Permitir lectura pública de streams" 
ON streams FOR SELECT 
USING (true);

-- Política para permitir escritura a usuarios autenticados
CREATE POLICY "Permitir escritura a usuarios autenticados" 
ON streams FOR ALL 
USING (auth.role() = 'authenticated');
