declare namespace NodeJS {
  interface ProcessEnv {
    // Variables existentes
    NEXT_PUBLIC_PAYPAL_ENV: string
    NEXT_PUBLIC_DB_CHARACTER_NAME: string
    NEXT_PUBLIC_CHARACTER_NAME: string
    NEXT_PUBLIC_DB_PORT: string
    NEXT_PUBLIC_DB_USER: string
    NEXT_PUBLIC_DB_NAME: string
    NEXT_PUBLIC_DB_HOST: string
    NEXT_PUBLIC_DB_PASS: string
    
    // Nuevas variables sin el prefijo NEXT_PUBLIC_
    DB_CHARACTER_NAME: string
    DB_PORT: string
    DB_USER: string
    DB_NAME: string
    DB_HOST: string
    DB_PASS: string
    
    NEXT_SQL_DB_NAME: string
    SQL_DB_HOST: string
    SQL_DB_NAME: string
    SQL_DB_USER: string
    SQL_DB_PASS: string
    SQL_DB_PORT: string
    SQL_PDO_DRIVER: string
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    NEXT_PUBLIC_API_URL: string
    RECAPTCHA_SECRET_KEY: string
    // NEXT_PUBLIC_* variables are automatically included
    BLOB_READ_WRITE_TOKEN: string

    // Nueva variable para Resend
    RESEND_API_KEY: string
  }
}
