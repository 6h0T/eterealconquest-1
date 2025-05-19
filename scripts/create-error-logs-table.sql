-- Crear tabla para registrar errores de recursos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ErrorLogs' AND xtype='U')
BEGIN
    CREATE TABLE ErrorLogs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        url VARCHAR(500) NOT NULL,
        referrer VARCHAR(500) NULL,
        userAgent VARCHAR(500) NULL,
        timestamp DATETIME NOT NULL,
        resolved BIT DEFAULT 0
    )
    
    CREATE INDEX IX_ErrorLogs_Type ON ErrorLogs(type)
    CREATE INDEX IX_ErrorLogs_Timestamp ON ErrorLogs(timestamp)
    CREATE INDEX IX_ErrorLogs_Resolved ON ErrorLogs(resolved)
    
    PRINT 'Tabla ErrorLogs creada correctamente'
END
ELSE
BEGIN
    PRINT 'La tabla ErrorLogs ya existe'
END
