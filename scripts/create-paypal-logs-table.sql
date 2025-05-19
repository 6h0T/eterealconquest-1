-- Create PayPal logs table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WEBENGINE_PAYPAL_LOGS' AND xtype='U')
BEGIN
    CREATE TABLE WEBENGINE_PAYPAL_LOGS (
        id INT IDENTITY(1,1) PRIMARY KEY,
        account VARCHAR(50) NOT NULL,
        txn_id VARCHAR(100) NOT NULL,
        amount FLOAT NOT NULL,
        timestamp DATETIME NOT NULL,
        processed BIT DEFAULT 1
    )
END
GO

-- Create credits configuration table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='WEBENGINE_CREDITS_CONFIG' AND xtype='U')
BEGIN
    CREATE TABLE WEBENGINE_CREDITS_CONFIG (
        config_id INT IDENTITY(1,1) PRIMARY KEY,
        config_name VARCHAR(50) NOT NULL,
        config_table VARCHAR(50) NOT NULL,
        config_user_col VARCHAR(50) NOT NULL,
        config_credits_col VARCHAR(50) NOT NULL,
        config_display BIT DEFAULT 1,
        config_rate FLOAT DEFAULT 1000
    )
    
    -- Insert default configuration for WCoinC
    INSERT INTO WEBENGINE_CREDITS_CONFIG (config_name, config_table, config_user_col, config_credits_col, config_display, config_rate)
    VALUES ('WCoinC', 'MEMB_INFO', 'memb___id', 'wcoinc', 1, 1000)
END
GO
