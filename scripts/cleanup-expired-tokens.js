// scripts/cleanup-expired-tokens.js
// Script para limpiar tokens expirados y resolver problemas de verificación

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

async function cleanupExpiredTokens() {
  console.log('🧹 Iniciando limpieza de tokens expirados...\n')

  try {
    const pool = await sql.connect(config)
    console.log('✅ Conectado a la base de datos\n')

    // 1. MOSTRAR ESTADÍSTICAS ANTES DE LA LIMPIEZA
    console.log('📊 ESTADÍSTICAS ANTES DE LA LIMPIEZA:')
    
    // Cuentas pendientes totales
    const totalPending = await pool.request().query('SELECT COUNT(*) as total FROM PendingAccounts')
    console.log(`   📋 Total cuentas pendientes: ${totalPending.recordset[0].total}`)
    
    // Cuentas pendientes válidas
    const validPending = await pool.request().query('SELECT COUNT(*) as total FROM PendingAccounts WHERE expires_at > GETUTCDATE()')
    console.log(`   ✅ Cuentas pendientes válidas: ${validPending.recordset[0].total}`)
    
    // Cuentas pendientes expiradas
    const expiredPending = await pool.request().query('SELECT COUNT(*) as total FROM PendingAccounts WHERE expires_at <= GETUTCDATE()')
    console.log(`   ❌ Cuentas pendientes expiradas: ${expiredPending.recordset[0].total}`)
    
    // Tokens de recuperación expirados
    const expiredRecovery = await pool.request().query('SELECT COUNT(*) as total FROM PasswordRecovery2 WHERE expires <= GETUTCDATE()')
    console.log(`   🔑 Tokens de recuperación expirados: ${expiredRecovery.recordset[0].total}`)

    console.log('\n🗑️ INICIANDO LIMPIEZA...\n')

    // 2. ELIMINAR CUENTAS PENDIENTES EXPIRADAS
    console.log('1️⃣ Eliminando cuentas pendientes expiradas...')
    const deletedPending = await pool.request().query(`
      DELETE FROM PendingAccounts 
      WHERE expires_at <= GETUTCDATE()
    `)
    console.log(`   ✅ Eliminadas ${deletedPending.rowsAffected[0]} cuentas pendientes expiradas`)

    // 3. ELIMINAR TOKENS DE RECUPERACIÓN EXPIRADOS
    console.log('2️⃣ Eliminando tokens de recuperación expirados...')
    const deletedRecovery = await pool.request().query(`
      DELETE FROM PasswordRecovery2 
      WHERE expires <= GETUTCDATE()
    `)
    console.log(`   ✅ Eliminados ${deletedRecovery.rowsAffected[0]} tokens de recuperación expirados`)

    // 4. LIMPIAR LOGS ANTIGUOS (más de 30 días)
    console.log('3️⃣ Limpiando logs antiguos (más de 30 días)...')
    const deletedLogs = await pool.request().query(`
      DELETE FROM EmailVerificationLog 
      WHERE created_at < DATEADD(day, -30, GETUTCDATE())
    `)
    console.log(`   ✅ Eliminados ${deletedLogs.rowsAffected[0]} logs antiguos`)

    // 5. MOSTRAR ESTADÍSTICAS DESPUÉS DE LA LIMPIEZA
    console.log('\n📊 ESTADÍSTICAS DESPUÉS DE LA LIMPIEZA:')
    
    const newTotalPending = await pool.request().query('SELECT COUNT(*) as total FROM PendingAccounts')
    console.log(`   📋 Total cuentas pendientes: ${newTotalPending.recordset[0].total}`)
    
    const newValidPending = await pool.request().query('SELECT COUNT(*) as total FROM PendingAccounts WHERE expires_at > GETUTCDATE()')
    console.log(`   ✅ Cuentas pendientes válidas: ${newValidPending.recordset[0].total}`)
    
    const newRecoveryCount = await pool.request().query('SELECT COUNT(*) as total FROM PasswordRecovery2')
    console.log(`   🔑 Tokens de recuperación activos: ${newRecoveryCount.recordset[0].total}`)
    
    const newLogCount = await pool.request().query('SELECT COUNT(*) as total FROM EmailVerificationLog')
    console.log(`   📝 Logs de verificación: ${newLogCount.recordset[0].total}`)

    // 6. MOSTRAR CUENTAS PENDIENTES ACTUALES (si las hay)
    console.log('\n🔍 CUENTAS PENDIENTES ACTUALES:')
    const currentPending = await pool.request().query(`
      SELECT TOP 10 username, email, expires_at,
             CASE WHEN expires_at > GETUTCDATE() THEN 'VÁLIDO' ELSE 'EXPIRADO' END as status,
             DATEDIFF(minute, GETUTCDATE(), expires_at) as minutes_left
      FROM PendingAccounts 
      ORDER BY created_at DESC
    `)
    
    if (currentPending.recordset.length > 0) {
      console.log(`   📋 ${currentPending.recordset.length} cuentas pendientes encontradas:`)
      currentPending.recordset.forEach(account => {
        const timeLeft = account.minutes_left > 0 ? `${Math.floor(account.minutes_left / 60)}h ${account.minutes_left % 60}m restantes` : 'EXPIRADO'
        console.log(`      - ${account.username} (${account.email}) - ${account.status} (${timeLeft})`)
      })
    } else {
      console.log(`   ✨ No hay cuentas pendientes - Todo limpio!`)
    }

    await pool.close()
    console.log('\n🎉 Limpieza completada exitosamente!')
    
    // 7. RECOMENDACIONES
    console.log('\n💡 RECOMENDACIONES:')
    console.log('   1. Tokens de verificación expiran en 24 horas')
    console.log('   2. Si necesitas verificar una cuenta, regístrate nuevamente')
    console.log('   3. Los usuarios pueden usar el reenvío de verificación')
    console.log('   4. Ejecuta este script semanalmente para mantener la BD limpia')
    
  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error.message)
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupExpiredTokens()
    .then(() => {
      console.log('\n✅ Script completado exitosamente')
      process.exit(0)
    })
    .catch(() => {
      console.log('\n💥 Script falló')
      process.exit(1)
    })
}

module.exports = { cleanupExpiredTokens } 