IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PasswordRecovery' AND xtype='U')
BEGIN
    CREATE TABLE PasswordRecovery (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(50) NOT NULL,
        memb___id NVARCHAR(10) NOT NULL,
        token NVARCHAR(100) NOT NULL,
        expires_at DATETIME NOT NULL,
        used BIT DEFAULT 0,
        created_at DATETIME DEFAULT GETUTCDATE()
    )
END
