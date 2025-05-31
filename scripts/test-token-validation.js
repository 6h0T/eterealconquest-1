// Script para probar la validación de tokens con reintentos
// Ejecutar con: node scripts/test-token-validation.js

// Usar fetch nativo de Node.js (disponible desde Node 18+)
// Si no está disponible, usar una implementación alternativa
let fetch;
try {
  fetch = globalThis.fetch;
  if (!fetch) {
    // Fallback para versiones anteriores de Node.js
    fetch = require('node-fetch');
  }
} catch (error) {
  console.error('❌ Error: No se pudo cargar fetch. Asegúrate de usar Node.js 18+ o instalar node-fetch');
  process.exit(1);
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Función para simular delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para probar la validación de un token
async function testTokenValidation(token, description) {
  console.log(`\n🧪 Probando: ${description}`);
  console.log(`Token: ${token ? token.substring(0, 10) + '...' : '(vacío)'}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`, data);
    
    if (response.ok && data.success) {
      console.log(`✅ Éxito: ${data.message}`);
    } else {
      console.log(`❌ Error: ${data.error}`);
    }
    
    return { success: response.ok && data.success, data };
  } catch (error) {
    console.log(`💥 Error de conexión:`, error.message);
    return { success: false, error: error.message };
  }
}

// Función para probar múltiples intentos
async function testMultipleAttempts(token, maxAttempts = 3) {
  console.log(`\n🔄 Probando múltiples intentos para token: ${token ? token.substring(0, 10) + '...' : '(vacío)'}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n--- Intento ${attempt}/${maxAttempts} ---`);
    
    const result = await testTokenValidation(token, `Intento ${attempt}`);
    
    if (result.success) {
      console.log(`🎉 Éxito en intento ${attempt}!`);
      return true;
    }
    
    if (attempt < maxAttempts) {
      const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      console.log(`⏳ Esperando ${delayMs}ms antes del siguiente intento...`);
      await delay(delayMs);
    }
  }
  
  console.log(`❌ Todos los intentos fallaron`);
  return false;
}

// Función principal de pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de validación de tokens...');
  console.log(`🌐 URL Base: ${BASE_URL}`);
  console.log(`📦 Usando fetch: ${fetch.name || 'nativo'}`);
  
  // Casos de prueba
  const testCases = [
    {
      token: 'invalid_token_123',
      description: 'Token inválido',
      expectedSuccess: false
    },
    {
      token: 'expired_token_456',
      description: 'Token expirado simulado',
      expectedSuccess: false
    },
    {
      token: '', // Token vacío
      description: 'Token vacío',
      expectedSuccess: false
    }
  ];
  
  console.log('\n📝 Ejecutando casos de prueba individuales...');
  
  for (const testCase of testCases) {
    await testTokenValidation(testCase.token, testCase.description);
    await delay(1000); // Pausa entre pruebas
  }
  
  console.log('\n🔄 Probando sistema de reintentos...');
  await testMultipleAttempts('test_retry_token_789');
  
  console.log('\n✨ Pruebas completadas!');
  console.log('\n📋 Resumen de mejoras implementadas:');
  console.log('  ✅ Reintentos automáticos en backend (3 intentos)');
  console.log('  ✅ Delay exponencial entre reintentos');
  console.log('  ✅ Mejor manejo de errores específicos');
  console.log('  ✅ Timeouts aumentados para conexiones');
  console.log('  ✅ Pool de conexiones mejorado');
  console.log('  ✅ Reintentos en frontend con feedback visual');
  console.log('  ✅ Logging detallado para debugging');
  
  console.log('\n🔧 Para probar con un token real:');
  console.log('  1. Registra una nueva cuenta');
  console.log('  2. Copia el token del email de verificación');
  console.log('  3. Ejecuta: node scripts/test-token-validation.js <token>');
}

// Permitir probar un token específico desde línea de comandos
if (process.argv[2]) {
  const token = process.argv[2];
  console.log(`🎯 Probando token específico: ${token.substring(0, 10)}...`);
  testMultipleAttempts(token).then(() => {
    console.log('✅ Prueba completada');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
  });
} else {
  runTests().then(() => {
    console.log('🏁 Todas las pruebas completadas');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error en las pruebas:', error);
    process.exit(1);
  });
} 