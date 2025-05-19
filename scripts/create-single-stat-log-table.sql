-- Tabla para registrar los cambios de estadísticas individuales
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CharacterStatsLog]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[CharacterStatsLog](
        [LogID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [CharacterName] [varchar](10) NOT NULL,
        [StatType] [varchar](20) NOT NULL,
        [AmountAdded] [int] NOT NULL,
        [DateAdded] [datetime] NOT NULL
    )
    
    CREATE INDEX [IX_CharacterStatsLog_CharacterName] ON [dbo].[CharacterStatsLog]([CharacterName])
    CREATE INDEX [IX_CharacterStatsLog_DateAdded] ON [dbo].[CharacterStatsLog]([DateAdded])
    
    PRINT 'Tabla CharacterStatsLog creada correctamente.'
END
ELSE
BEGIN
    PRINT 'La tabla CharacterStatsLog ya existe.'
END
