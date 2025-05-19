-- Script para crear la tabla de registro de cambios de email
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EmailChangeLog' AND xtype='U')
CREATE TABLE EmailChangeLog (
   LogID INT IDENTITY(1,1) PRIMARY KEY,
   AccountID VARCHAR(10) NOT NULL,
   NewEmail VARCHAR(50) NOT NULL,
   IPAddress VARCHAR(45) NOT NULL,
   ChangeDate DATETIME NOT NULL
)
GO

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IX_EmailChangeLog_AccountID ON EmailChangeLog(AccountID)
CREATE INDEX IX_EmailChangeLog_ChangeDate ON EmailChangeLog(ChangeDate)
GO
