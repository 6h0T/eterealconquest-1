-- =======================================================
-- SCRIPT MEJORADO PARA REPARAR/CREAR TABLAS NECESARIAS
-- Ejecutar en MSSQL Server para solucionar problemas de verificación
-- =======================================================

PRINT '🔧 Iniciando reparación/creación de tablas...'
PRINT ''

-- ===========================================
-- 1. TABLA PendingAccounts
-- ===========================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PendingAccounts' AND xtype='U')
BEGIN
    PRINT '📋 Creando tabla PendingAccounts...'
    
    CREATE TABLE PendingAccounts (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(10) NOT NULL UNIQUE,
        password NVARCHAR(50) NOT NULL,
        email NVARCHAR(50) NOT NULL,
        verification_token NVARCHAR(100) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT GETUTCDATE(),
        expires_at DATETIME NOT NULL,
        ip_address NVARCHAR(45) NULL,
        user_agent NVARCHAR(500) NULL
    )
    
    -- Índices para mejorar rendimiento
    CREATE INDEX IX_PendingAccounts_Username ON PendingAccounts(username)
    CREATE INDEX IX_PendingAccounts_Email ON PendingAccounts(email)
    CREATE INDEX IX_PendingAccounts_Token ON PendingAccounts(verification_token)
    CREATE INDEX IX_PendingAccounts_ExpiresAt ON PendingAccounts(expires_at)
    CREATE INDEX IX_PendingAccounts_CreatedAt ON PendingAccounts(created_at)
    
    PRINT '   ✅ Tabla PendingAccounts creada exitosamente'
END
ELSE
BEGIN
    PRINT '   ℹ️  Tabla PendingAccounts ya existe'
    
    -- Verificar y agregar columnas faltantes si es necesario
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PendingAccounts' AND COLUMN_NAME = 'created_at')
    BEGIN
        PRINT '   🔧 Agregando columna created_at...'
        ALTER TABLE PendingAccounts ADD created_at DATETIME DEFAULT GETUTCDATE()
    END
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PendingAccounts' AND COLUMN_NAME = 'ip_address')
    BEGIN
        PRINT '   🔧 Agregando columna ip_address...'
        ALTER TABLE PendingAccounts ADD ip_address NVARCHAR(45) NULL
    END
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PendingAccounts' AND COLUMN_NAME = 'user_agent')
    BEGIN
        PRINT '   🔧 Agregando columna user_agent...'
        ALTER TABLE PendingAccounts ADD user_agent NVARCHAR(500) NULL
    END
END

-- ===========================================
-- 2. TABLA EmailVerificationLog
-- ===========================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EmailVerificationLog' AND xtype='U')
BEGIN
    PRINT '📋 Creando tabla EmailVerificationLog...'
    
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
    
    -- Índices para mejorar rendimiento
    CREATE INDEX IX_EmailVerificationLog_Email ON EmailVerificationLog(email)
    CREATE INDEX IX_EmailVerificationLog_Username ON EmailVerificationLog(username)
    CREATE INDEX IX_EmailVerificationLog_Action ON EmailVerificationLog(action)
    CREATE INDEX IX_EmailVerificationLog_CreatedAt ON EmailVerificationLog(created_at)
    
    PRINT '   ✅ Tabla EmailVerificationLog creada exitosamente'
END
ELSE
BEGIN
    PRINT '   ℹ️  Tabla EmailVerificationLog ya existe'
END

-- ===========================================
-- 3. TABLA PasswordRecovery2
-- ===========================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PasswordRecovery2' AND xtype='U')
BEGIN
    PRINT '📋 Creando tabla PasswordRecovery2...'
    
    CREATE TABLE PasswordRecovery2 (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(50) NOT NULL,
        memb___id NVARCHAR(10) NOT NULL,
        token NVARCHAR(100) NOT NULL UNIQUE,
        expires DATETIME NOT NULL,
        created_at DATETIME DEFAULT GETUTCDATE(),
        used BIT DEFAULT 0,
        used_at DATETIME NULL
    )
    
    -- Índices para mejorar rendimiento
    CREATE INDEX IX_PasswordRecovery2_Email ON PasswordRecovery2(email)
    CREATE INDEX IX_PasswordRecovery2_Username ON PasswordRecovery2(memb___id)
    CREATE INDEX IX_PasswordRecovery2_Token ON PasswordRecovery2(token)
    CREATE INDEX IX_PasswordRecovery2_Expires ON PasswordRecovery2(expires)
    
    PRINT '   ✅ Tabla PasswordRecovery2 creada exitosamente'
END
ELSE
BEGIN
    PRINT '   ℹ️  Tabla PasswordRecovery2 ya existe'
    
    -- Verificar y agregar columnas faltantes
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PasswordRecovery2' AND COLUMN_NAME = 'created_at')
    BEGIN
        PRINT '   🔧 Agregando columna created_at...'
        ALTER TABLE PasswordRecovery2 ADD created_at DATETIME DEFAULT GETUTCDATE()
    END
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PasswordRecovery2' AND COLUMN_NAME = 'used')
    BEGIN
        PRINT '   🔧 Agregando columna used...'
        ALTER TABLE PasswordRecovery2 ADD used BIT DEFAULT 0
    END
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PasswordRecovery2' AND COLUMN_NAME = 'used_at')
    BEGIN
        PRINT '   🔧 Agregando columna used_at...'
        ALTER TABLE PasswordRecovery2 ADD used_at DATETIME NULL
    END
END

-- ===========================================
-- 4. VERIFICAR TABLA MEMB_INFO
-- ===========================================
IF EXISTS (SELECT * FROM sysobjects WHERE name='MEMB_INFO' AND xtype='U')
BEGIN
    PRINT '✅ Tabla MEMB_INFO verificada - EXISTE'
    
    -- Verificar columnas críticas
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MEMB_INFO' AND COLUMN_NAME = 'memb___id')
        PRINT '   ✅ Columna memb___id - OK'
    ELSE
        PRINT '   ❌ Columna memb___id - FALTANTE'
    
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MEMB_INFO' AND COLUMN_NAME = 'mail_addr')
        PRINT '   ✅ Columna mail_addr - OK'
    ELSE
        PRINT '   ❌ Columna mail_addr - FALTANTE'
    
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'MEMB_INFO' AND COLUMN_NAME = 'memb__pwd')
        PRINT '   ✅ Columna memb__pwd - OK'
    ELSE
        PRINT '   ❌ Columna memb__pwd - FALTANTE'
END
ELSE
BEGIN
    PRINT '❌ TABLA MEMB_INFO NO EXISTE - ESTE ES UN PROBLEMA CRÍTICO'
    PRINT '   Esta tabla debería existir en tu servidor MU Online'
    PRINT '   Contacta al administrador de la base de datos'
END

-- ===========================================
-- 5. LIMPIAR DATOS ANTIGUOS/CORRUPTOS
-- ===========================================
PRINT ''
PRINT '🧹 Limpiando datos antiguos...'

-- Eliminar cuentas pendientes expiradas (más de 7 días)
IF EXISTS (SELECT * FROM sysobjects WHERE name='PendingAccounts' AND xtype='U')
BEGIN
    DECLARE @deletedCount INT
    
    DELETE FROM PendingAccounts 
    WHERE expires_at < DATEADD(day, -7, GETUTCDATE())
    
    SET @deletedCount = @@ROWCOUNT
    PRINT '   🗑️ Eliminadas ' + CAST(@deletedCount AS NVARCHAR(10)) + ' cuentas pendientes expiradas'
END

-- Eliminar tokens de recuperación expirados (más de 3 días)
IF EXISTS (SELECT * FROM sysobjects WHERE name='PasswordRecovery2' AND xtype='U')
BEGIN
    DELETE FROM PasswordRecovery2 
    WHERE expires < DATEADD(day, -3, GETUTCDATE())
    
    SET @deletedCount = @@ROWCOUNT
    PRINT '   🗑️ Eliminados ' + CAST(@deletedCount AS NVARCHAR(10)) + ' tokens de recuperación expirados'
END

-- ===========================================
-- 6. ESTADÍSTICAS FINALES
-- ===========================================
PRINT ''
PRINT '📊 ESTADÍSTICAS ACTUALES:'

IF EXISTS (SELECT * FROM sysobjects WHERE name='MEMB_INFO' AND xtype='U')
BEGIN
    DECLARE @membCount INT
    SELECT @membCount = COUNT(*) FROM MEMB_INFO
    PRINT '   👥 Cuentas registradas: ' + CAST(@membCount AS NVARCHAR(10))
END

IF EXISTS (SELECT * FROM sysobjects WHERE name='PendingAccounts' AND xtype='U')
BEGIN
    DECLARE @pendingCount INT, @expiredCount INT
    SELECT @pendingCount = COUNT(*) FROM PendingAccounts WHERE expires_at > GETUTCDATE()
    SELECT @expiredCount = COUNT(*) FROM PendingAccounts WHERE expires_at <= GETUTCDATE()
    PRINT '   ⏳ Cuentas pendientes válidas: ' + CAST(@pendingCount AS NVARCHAR(10))
    PRINT '   ⏰ Cuentas pendientes expiradas: ' + CAST(@expiredCount AS NVARCHAR(10))
END

IF EXISTS (SELECT * FROM sysobjects WHERE name='PasswordRecovery2' AND xtype='U')
BEGIN
    DECLARE @recoveryCount INT
    SELECT @recoveryCount = COUNT(*) FROM PasswordRecovery2 WHERE expires > GETUTCDATE()
    PRINT '   🔑 Tokens de recuperación activos: ' + CAST(@recoveryCount AS NVARCHAR(10))
END

-- ===========================================
-- 7. RESUMEN FINAL
-- ===========================================
PRINT ''
PRINT '🎉 REPARACIÓN/VERIFICACIÓN COMPLETADA'
PRINT ''
PRINT 'Si aún tienes problemas:'
PRINT '1. Verifica los permisos del usuario SQL'
PRINT '2. Verifica la conectividad de red'
PRINT '3. Revisa los logs de MSSQL Server'
PRINT '4. Contacta al administrador del servidor' 