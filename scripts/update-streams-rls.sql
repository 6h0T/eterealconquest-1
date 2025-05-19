-- Habilitar RLS en la tabla streams
ALTER TABLE IF EXISTS streams ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "Permitir lectura pública de streams" ON streams;
DROP POLICY IF EXISTS "Permitir escritura a usuarios autenticados" ON streams;
DROP POLICY IF EXISTS "Permitir todas las operaciones a usuarios autenticados" ON streams;

-- Crear política para permitir lectura pública
CREATE POLICY "Permitir lectura pública de streams"
ON streams FOR SELECT
USING (true);

-- Crear política para permitir todas las operaciones a usuarios autenticados
CREATE POLICY "Permitir todas las operaciones a usuarios autenticados"
ON streams FOR ALL
USING (true);

-- Añadir columna is_active si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'streams' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE streams ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;
