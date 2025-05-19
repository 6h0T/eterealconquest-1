-- Primero, verificamos si la columna is_active existe, y si no, la añadimos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'streams'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE streams ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- No intentamos crear políticas que ya existen
-- En su lugar, podemos actualizar las políticas existentes si es necesario

-- Actualizar la política de lectura si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'streams' 
        AND policyname = 'Permitir lectura pública de streams'
    ) THEN
        DROP POLICY "Permitir lectura pública de streams" ON streams;
    END IF;
    
    CREATE POLICY "Permitir lectura pública de streams" 
    ON streams FOR SELECT 
    USING (true);
END $$;

-- Actualizar la política de escritura si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'streams' 
        AND policyname = 'Permitir escritura a usuarios autenticados'
    ) THEN
        DROP POLICY "Permitir escritura a usuarios autenticados" ON streams;
    END IF;
    
    CREATE POLICY "Permitir escritura a usuarios autenticados" 
    ON streams FOR ALL 
    USING (auth.role() = 'authenticated');
END $$;

-- Asegurarse de que RLS está habilitado
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
