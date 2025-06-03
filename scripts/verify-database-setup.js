// scripts/verify-database-setup.js
// Script para verificar que todas las tablas necesarias existan

const path = require('path')

// Importar funciones de base de datos usando require
async function loadDBFunctions() {
  try {
    // Intentar cargar el módulo de BD
    const dbModule = require('../lib/db')
    return dbModule
  } catch (error) {
    console.error('❌ Error cargando módulo de base de datos:', error.message)
    console.log('💡 Asegúrate de que el proyecto esté correctamente configurado')
    throw error
  }
}

async function verifyDatabaseSetup() {
  console.log('🔍 Verificando configuración de la base de datos...\n')

  try {
    const { executeQueryWithRetry } = await loadDBFunctions()
    
    // Lista de tablas requeridas
    const requiredTables = [
      'MEMB_INFO',
      'PendingAccounts', 
      'EmailVerificationLog',
      'PasswordRecovery2'
    ]

    const result = await executeQueryWithRetry(async (pool) => {
      console.log('✅ Conexión a la base de datos exitosa')

      // Verificar cada tabla
      for (const tableName of requiredTables) {
        console.log(`\n📋 Verificando tabla: ${tableName}`)
        
        const tableCheck = await pool
          .request()
          .input('tableName', tableName)
          .query(`
            SELECT CASE 
              WHEN EXISTS (
                SELECT * FROM sysobjects 
                WHERE name = '${tableName}' AND xtype = 'U'
              ) 
              THEN 1 ELSE 0 
            END AS TableExists
          `)

        const exists = tableCheck.recordset[0].TableExists === 1
        
        if (exists) {
          console.log(`   ✅ ${tableName} - EXISTE`)
          
          // Mostrar estructura de la tabla
          const columns = await pool
            .request()
            .query(`
              SELECT 
                COLUMN_NAME, 
                DATA_TYPE, 
                IS_NULLABLE,
                COLUMN_DEFAULT
              FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = '${tableName}'
              ORDER BY ORDINAL_POSITION
            `)
          
          console.log(`   📊 Columnas (${columns.recordset.length}):`)
          columns.recordset.forEach(col => {
            console.log(`      - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`)
          })

          // Contar registros si es tabla pequeña
          if (['PendingAccounts', 'EmailVerificationLog', 'PasswordRecovery2'].includes(tableName)) {
            const count = await pool
              .request()
              .query(`SELECT COUNT(*) as total FROM ${tableName}`)
            console.log(`   📈 Registros: ${count.recordset[0].total}`)
          }

        } else {
          console.log(`   ❌ ${tableName} - NO EXISTE`)
          console.log(`   💡 Necesitas ejecutar: scripts/fix-database-tables.sql`)
        }
      }

      // Verificar configuración de MEMB_INFO
      console.log(`\n🔍 Verificando configuración específica...`)
      
      const membCount = await pool
        .request()
        .query('SELECT COUNT(*) as total FROM MEMB_INFO')
      console.log(`📊 Cuentas registradas en MEMB_INFO: ${membCount.recordset[0].total}`)

      // Verificar cuentas pendientes
      if (requiredTables.includes('PendingAccounts')) {
        try {
          const pendingCount = await pool
            .request()
            .query('SELECT COUNT(*) as total FROM PendingAccounts WHERE expires_at > GETUTCDATE()')
          console.log(`⏳ Cuentas pendientes de verificación: ${pendingCount.recordset[0].total}`)

          // Verificar cuentas expiradas
          const expiredCount = await pool
            .request()
            .query('SELECT COUNT(*) as total FROM PendingAccounts WHERE expires_at <= GETUTCDATE()')
          console.log(`⏰ Cuentas pendientes expiradas: ${expiredCount.recordset[0].total}`)
        } catch (e) {
          console.log(`❌ Error consultando PendingAccounts: ${e.message}`)
        }
      }

      return {
        success: true,
        message: 'Verificación completada'
      }
    })

    console.log('\n✅ Verificación de base de datos completada exitosamente')
    return result

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message)
    console.error('🔧 Posibles soluciones:')
    console.error('   1. Verificar credenciales de base de datos')
    console.error('   2. Verificar conectividad de red')
    console.error('   3. Ejecutar scripts/fix-database-tables.sql')
    console.error('   4. Verificar permisos de usuario SQL')
    
    throw error
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifyDatabaseSetup()
    .then(() => {
      console.log('\n🎉 Script completado exitosamente')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Script falló:', error.message)
      process.exit(1)
    })
}

module.exports = { verifyDatabaseSetup } 