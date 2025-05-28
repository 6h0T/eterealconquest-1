-- Script para crear las tablas de verificación de email
-- Tabla para almacenar tokens de verificación de email
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EmailVerificationTokens' AND xtype='U')
BEGIN
    CREATE TABLE EmailVerificationTokens (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(50) NOT NULL,
        username NVARCHAR(10) NOT NULL,
        token NVARCHAR(100) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        verified BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETUTCDATE(),
        verified_at DATETIME NULL,
        ip_address NVARCHAR(45) NULL
    )
    
    -- Índices para mejorar el rendimiento
    CREATE INDEX IX_EmailVerificationTokens_Token ON EmailVerificationTokens(token)
    CREATE INDEX IX_EmailVerificationTokens_Email ON EmailVerificationTokens(email)
    CREATE INDEX IX_EmailVerificationTokens_Username ON EmailVerificationTokens(username)
    CREATE INDEX IX_EmailVerificationTokens_ExpiresAt ON EmailVerificationTokens(expires_at)
    
    PRINT 'Tabla EmailVerificationTokens creada correctamente'
END
ELSE
BEGIN
    PRINT 'La tabla EmailVerificationTokens ya existe'
END
GO

-- Tabla para almacenar cuentas pendientes de verificación
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PendingAccounts' AND xtype='U')
BEGIN
    CREATE TABLE PendingAccounts (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(10) NOT NULL UNIQUE,
        password NVARCHAR(50) NOT NULL,
        email NVARCHAR(50) NOT NULL,
        verification_token NVARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT GETUTCDATE(),
        expires_at DATETIME NOT NULL,
        ip_address NVARCHAR(45) NULL,
        user_agent NVARCHAR(500) NULL
    )
    
    -- Índices para mejorar el rendimiento
    CREATE INDEX IX_PendingAccounts_Username ON PendingAccounts(username)
    CREATE INDEX IX_PendingAccounts_Email ON PendingAccounts(email)
    CREATE INDEX IX_PendingAccounts_Token ON PendingAccounts(verification_token)
    CREATE INDEX IX_PendingAccounts_ExpiresAt ON PendingAccounts(expires_at)
    
    PRINT 'Tabla PendingAccounts creada correctamente'
END
ELSE
BEGIN
    PRINT 'La tabla PendingAccounts ya existe'
END
GO

-- Tabla para registrar intentos de verificación
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EmailVerificationLog' AND xtype='U')
BEGIN
    CREATE TABLE EmailVerificationLog (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(50) NOT NULL,
        username NVARCHAR(10) NOT NULL,
        action NVARCHAR(50) NOT NULL, -- 'sent', 'verified', 'expired', 'failed'
        ip_address NVARCHAR(45) NULL,
        user_agent NVARCHAR(500) NULL,
        created_at DATETIME DEFAULT GETUTCDATE(),
        details NVARCHAR(MAX) NULL
    )
    
    -- Índices para mejorar el rendimiento
    CREATE INDEX IX_EmailVerificationLog_Email ON EmailVerificationLog(email)
    CREATE INDEX IX_EmailVerificationLog_Username ON EmailVerificationLog(username)
    CREATE INDEX IX_EmailVerificationLog_Action ON EmailVerificationLog(action)
    CREATE INDEX IX_EmailVerificationLog_CreatedAt ON EmailVerificationLog(created_at)
    
    PRINT 'Tabla EmailVerificationLog creada correctamente'
END
ELSE
BEGIN
    PRINT 'La tabla EmailVerificationLog ya existe'
END
GO

-- Procedimiento para limpiar tokens expirados (opcional)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CleanupExpiredTokens' AND xtype='P')
BEGIN
    EXEC('
    CREATE PROCEDURE CleanupExpiredTokens
    AS
    BEGIN
        -- Eliminar tokens de verificación expirados (más de 24 horas)
        DELETE FROM EmailVerificationTokens 
        WHERE expires_at < GETUTCDATE() AND verified = 0
        
        -- Eliminar cuentas pendientes expiradas (más de 24 horas)
        DELETE FROM PendingAccounts 
        WHERE expires_at < GETUTCDATE()
        
        -- Registrar la limpieza
        INSERT INTO EmailVerificationLog (email, username, action, details)
        VALUES (''system'', ''system'', ''cleanup'', ''Limpieza automática de tokens expirados'')
    END
    ')
    
    PRINT 'Procedimiento CleanupExpiredTokens creado correctamente'
END
ELSE
BEGIN
    PRINT 'El procedimiento CleanupExpiredTokens ya existe'
END
GO

PRINT 'Script de verificación de email completado exitosamente' 