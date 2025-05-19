-- Script para crear la tabla de logs de estadísticas
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CharacterStatsLog' AND xtype='U')
CREATE TABLE CharacterStatsLog (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    AccountID VARCHAR(10) NOT NULL,
    CharacterName VARCHAR(10) NOT NULL,
    StrengthAdded INT NOT NULL,
    DexterityAdded INT NOT NULL,
    VitalityAdded INT NOT NULL,
    EnergyAdded INT NOT NULL,
    TotalPointsUsed INT NOT NULL,
    IPAddress VARCHAR(45) NOT NULL,
    Timestamp DATETIME NOT NULL
)
GO

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IX_CharacterStatsLog_AccountID ON CharacterStatsLog(AccountID)
CREATE INDEX IX_CharacterStatsLog_CharacterName ON CharacterStatsLog(CharacterName)
CREATE INDEX IX_CharacterStatsLog_Timestamp ON CharacterStatsLog(Timestamp)
GO
