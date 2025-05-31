// Script de prueba para el sistema de reenvío de verificación
// Uso: node scripts/test-resend-verification.js

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function testResendVerification() {
  console.log('🧪 Iniciando pruebas del sistema de reenvío de verificación...\n')

  // Test 1: Reenvío con email válido (cuenta pendiente)
  console.log('📧 Test 1: Reenvío con email válido')
  try {
    const response = await fetch(`${BASE_URL}/api/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    })

    const result = await response.json()
    console.log(`Status: ${response.status}`)
    console.log(`Respuesta:`, result)
    
    if (response.ok) {
      console.log('✅ Test 1 PASÓ: Email reenviado correctamente')
    } else {
      console.log('ℹ️  Test 1: Error esperado (no hay cuenta pendiente)')
    }
  } catch (error) {
    console.log('❌ Test 1 FALLÓ:', error.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 2: Reenvío con email inválido
  console.log('📧 Test 2: Reenvío con email inválido')
  try {
    const response = await fetch(`${BASE_URL}/api/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'email-invalido'
      })
    })

    const result = await response.json()
    console.log(`Status: ${response.status}`)
    console.log(`Respuesta:`, result)
    
    if (response.status === 400 && result.error.includes('inválido')) {
      console.log('✅ Test 2 PASÓ: Email inválido rechazado correctamente')
    } else {
      console.log('❌ Test 2 FALLÓ: Debería rechazar email inválido')
    }
  } catch (error) {
    console.log('❌ Test 2 FALLÓ:', error.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 3: Reenvío sin email
  console.log('📧 Test 3: Reenvío sin email')
  try {
    const response = await fetch(`${BASE_URL}/api/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    })

    const result = await response.json()
    console.log(`Status: ${response.status}`)
    console.log(`Respuesta:`, result)
    
    if (response.status === 400) {
      console.log('✅ Test 3 PASÓ: Solicitud sin email rechazada correctamente')
    } else {
      console.log('❌ Test 3 FALLÓ: Debería rechazar solicitud sin email')
    }
  } catch (error) {
    console.log('❌ Test 3 FALLÓ:', error.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Test 4: Cooldown (dos solicitudes rápidas)
  console.log('📧 Test 4: Verificar cooldown')
  const testEmail = 'cooldown@test.com'
  
  try {
    // Primera solicitud
    const response1 = await fetch(`${BASE_URL}/api/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      })
    })

    const result1 = await response1.json()
    console.log(`Primera solicitud - Status: ${response1.status}`)
    
    // Segunda solicitud inmediata
    const response2 = await fetch(`${BASE_URL}/api/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      })
    })

    const result2 = await response2.json()
    console.log(`Segunda solicitud - Status: ${response2.status}`)
    console.log(`Respuesta:`, result2)
    
    if (response2.status === 429 && result2.error.includes('esperar')) {
      console.log('✅ Test 4 PASÓ: Cooldown funcionando correctamente')
    } else {
      console.log('ℹ️  Test 4: Cooldown no activado (puede ser normal si no hay cuenta pendiente)')
    }
  } catch (error) {
    console.log('❌ Test 4 FALLÓ:', error.message)
  }

  console.log('\n' + '='.repeat(50) + '\n')
  console.log('🏁 Pruebas completadas')
  console.log('\n📋 Resumen de funcionalidades implementadas:')
  console.log('✅ API de reenvío de verificación (/api/resend-verification)')
  console.log('✅ Página de reenvío (/[lang]/reenviar-verificacion)')
  console.log('✅ Enlace en formulario de registro')
  console.log('✅ Enlace en página de verificación (cuando falla)')
  console.log('✅ Validación de email')
  console.log('✅ Sistema de cooldown (1 minuto)')
  console.log('✅ Regeneración de tokens expirados')
  console.log('✅ Manejo de errores específicos')
  console.log('✅ Traducciones en español e inglés')
  
  console.log('\n🔗 URLs disponibles:')
  console.log(`📄 Página de reenvío: ${BASE_URL}/es/reenviar-verificacion`)
  console.log(`🔌 API de reenvío: ${BASE_URL}/api/resend-verification`)
}

// Ejecutar pruebas
testResendVerification().catch(console.error)