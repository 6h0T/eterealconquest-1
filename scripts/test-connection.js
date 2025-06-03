// scripts/test-connection.js
// Script simple para probar conexión a la base de datos

const sql = require('mssql')

const config = {
  server: process.env.SQL_DB_HOST || process.env.DB_HOST || process.env.NEXT_PUBLIC_DB_HOST || "177.54.146.73",
  database: process.env.SQL_DB_NAME || process.env.DB_NAME || process.env.NEXT_PUBLIC_DB_NAME || "_obj",
  user: process.env.SQL_DB_USER || process.env.DB_USER || process.env.NEXT_PUBLIC_DB_USER || "sa2",
  password: process.env.SQL_DB_PASS || process.env.DB_PASS || process.env.NEXT_PUBLIC_DB_PASS || "qA83<tkA3<|6",
  port: Number(process.env.SQL_DB_PORT || process.env.DB_PORT || process.env.NEXT_PUBLIC_DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
}

async function testConnection() {
  console.log('🔍 Probando conexión a la base de datos MSSQL...\n')
  
  console.log('📡 Configuración de conexión:')
  console.log(`   Server: ${config.server}:${config.port}`)
  console.log(`   Database: ${config.database}`)
  console.log(`   User: ${config.user}`)
  console.log(`   Password: ${'*'.repeat(config.password.length)}\n`)

  try {
    console.log('🔌 Intentando conectar...')
    const pool = await sql.connect(config)
    console.log('✅ Conexión exitosa!\n')

    // Verificar tablas críticas
    console.log('📋 Verificando tablas necesarias...')
    
    const tables = ['MEMB_INFO', 'PendingAccounts', 'EmailVerificationLog', 'PasswordRecovery2']
    
    for (const tableName of tables) {
      try {
        const result = await pool.request().query(`
          SELECT CASE 
            WHEN EXISTS (SELECT * FROM sysobjects WHERE name='${tableName}' AND xtype='U') 
            THEN 1 ELSE 0 
          END as TableExists
        `)
        
        const exists = result.recordset[0].TableExists === 1
        console.log(`   ${exists ? '✅' : '❌'} ${tableName} - ${exists ? 'EXISTE' : 'NO EXISTE'}`)
        
        if (exists && tableName !== 'MEMB_INFO') {
          const count = await pool.request().query(`SELECT COUNT(*) as total FROM ${tableName}`)
          console.log(`      📊 Registros: ${count.recordset[0].total}`)
        }
      } catch (tableError) {
        console.log(`   ❌ ${tableName} - ERROR: ${tableError.message}`)
      }
    }

    // Probar una consulta simple en MEMB_INFO
    console.log('\n🧪 Probando consulta en MEMB_INFO...')
    try {
      const membResult = await pool.request().query('SELECT COUNT(*) as total FROM MEMB_INFO')
      console.log(`   ✅ Cuentas en MEMB_INFO: ${membResult.recordset[0].total}`)
    } catch (membError) {
      console.log(`   ❌ Error consultando MEMB_INFO: ${membError.message}`)
    }

    // Verificar un token de ejemplo si existe PendingAccounts
    console.log('\n🔍 Verificando cuentas pendientes...')
    try {
      const pendingResult = await pool.request().query(`
        SELECT TOP 5 username, email, expires_at, 
               CASE WHEN expires_at > GETUTCDATE() THEN 'VÁLIDO' ELSE 'EXPIRADO' END as status
        FROM PendingAccounts 
        ORDER BY created_at DESC
      `)
      
      if (pendingResult.recordset.length > 0) {
        console.log(`   📋 Últimas ${pendingResult.recordset.length} cuentas pendientes:`)
        pendingResult.recordset.forEach(account => {
          console.log(`      - ${account.username} (${account.email}) - ${account.status}`)
        })
      } else {
        console.log(`   ℹ️  No hay cuentas pendientes`)
      }
    } catch (pendingError) {
      console.log(`   ❌ Error consultando cuentas pendientes: ${pendingError.message}`)
    }

    await pool.close()
    console.log('\n🎉 Prueba de conexión completada exitosamente!')
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message)
    console.error('\n🔧 Posibles causas:')
    console.error('   1. Servidor MSSQL no está corriendo')
    console.error('   2. Credenciales incorrectas')
    console.error('   3. Firewall bloqueando conexión')
    console.error('   4. Base de datos no existe')
    console.error('   5. Problemas de red/latencia')
    
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('\n✅ Test completado')
      process.exit(0)
    })
    .catch(() => {
      console.log('\n💥 Test falló')
      process.exit(1)
    })
}

module.exports = { testConnection } 