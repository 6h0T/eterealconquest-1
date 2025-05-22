-- Verificar si la tabla existe y crearla si no
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PasswordRecovery2' AND xtype='U')
BEGIN
    PRINT 'Creando tabla PasswordRecovery2...'
    CREATE TABLE PasswordRecovery2 (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(50) NOT NULL,
        memb___id NVARCHAR(10) NOT NULL,
        token NVARCHAR(100) NOT NULL,
        expires DATETIME NOT NULL,
        used BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETUTCDATE()
    )
    PRINT 'Tabla PasswordRecovery2 creada exitosamente'
END
ELSE
BEGIN
    PRINT 'La tabla PasswordRecovery2 ya existe'
END

-- Mostrar la estructura de la tabla
PRINT 'Estructura de la tabla PasswordRecovery2:'
EXEC sp_columns 'PasswordRecovery2'

-- Verificar si hay registros en la tabla
PRINT 'Conteo de registros en PasswordRecovery2:'
SELECT COUNT(*) AS NumRecords FROM PasswordRecovery2 