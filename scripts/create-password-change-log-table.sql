IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PasswordChangeLog' AND xtype='U')
BEGIN
    CREATE TABLE PasswordChangeLog (
        id INT IDENTITY(1,1) PRIMARY KEY,
        memb___id NVARCHAR(10) NOT NULL,
        email NVARCHAR(50) NOT NULL,
        change_date DATETIME NOT NULL,
        change_type NVARCHAR(20) NOT NULL, -- 'reset', 'change', etc.
        created_at DATETIME DEFAULT GETDATE()
    )
END
