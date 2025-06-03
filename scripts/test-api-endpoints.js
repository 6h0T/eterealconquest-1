// scripts/test-api-endpoints.js
// Script para probar endpoints de la API y verificar respuestas JSON

const https = require('https')
const http = require('http')

// Configuración
const BASE_URL = 'https://www.eterealconquest.com'
const TEST_TOKEN = 'test123456789' // Token de prueba

const endpoints = [
  {
    name: 'Verify Email API',
    method: 'POST',
    path: '/api/verify-email',
    body: { token: TEST_TOKEN },
    expectJSON: true
  },
  {
    name: 'Resend Verification API',
    method: 'POST', 
    path: '/api/resend-verification',
    body: { identifier: 'test@gmail.com', isEmail: true },
    expectJSON: true
  },
  {
    name: 'Recover Password API',
    method: 'POST',
    path: '/api/recover-password', 
    body: { identifier: 'test@gmail.com', isEmail: true },
    expectJSON: true
  },
  {
    name: 'Reenviar Verificacion Page',
    method: 'GET',
    path: '/es/reenviar-verificacion',
    body: null,
    expectJSON: false,
    expectHTML: true
  },
  {
    name: 'Verificar Email Page',
    method: 'GET',
    path: '/es/verificar-email?token=test123',
    body: null,
    expectJSON: false,
    expectHTML: true
  }
]

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(BASE_URL + endpoint.path)
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': endpoint.expectJSON ? 'application/json' : 'text/html,application/xhtml+xml',
        'Cache-Control': 'no-cache'
      }
    }

    const client = url.protocol === 'https:' ? https : http
    
    const req = client.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data,
          contentType: res.headers['content-type'] || 'unknown'
        })
      })
    })

    req.on('error', (error) => {
      resolve({
        statusCode: 0,
        statusMessage: 'Connection Error',
        headers: {},
        body: '',
        contentType: 'error',
        error: error.message
      })
    })

    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body))
    }
    
    req.end()
  })
}

async function testEndpoints() {
  console.log('🧪 Probando endpoints de la API...\n')
  console.log(`🌐 Base URL: ${BASE_URL}\n`)

  for (const endpoint of endpoints) {
    console.log(`📡 Probando: ${endpoint.name}`)
    console.log(`   ${endpoint.method} ${endpoint.path}`)
    
    try {
      const response = await makeRequest(endpoint)
      
      // Análisis de respuesta
      console.log(`   📊 Status: ${response.statusCode} ${response.statusMessage}`)
      console.log(`   📄 Content-Type: ${response.contentType}`)
      
      if (response.statusCode === 0) {
        console.log(`   ❌ Error de conexión: ${response.error}`)
      } else if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`   ✅ Respuesta exitosa`)
        
        // Verificar si es JSON válido
        if (endpoint.expectJSON) {
          try {
            const jsonData = JSON.parse(response.body)
            console.log(`   📋 JSON válido: ${JSON.stringify(jsonData).substring(0, 100)}...`)
          } catch (jsonError) {
            console.log(`   ❌ JSON inválido: ${response.body.substring(0, 100)}...`)
          }
        } else if (endpoint.expectHTML) {
          const isHTML = response.body.includes('<!DOCTYPE') || response.body.includes('<html')
          console.log(`   📄 ${isHTML ? '✅ HTML válido' : '❌ HTML inválido'}`)
        }
        
      } else if (response.statusCode === 403) {
        console.log(`   🚫 PROBLEMA: Error 403 Forbidden`)
        console.log(`   🔍 Primeros 200 caracteres: ${response.body.substring(0, 200)}`)
        
        // Verificar si es página de error
        if (response.body.includes('<!DOCTYPE') || response.body.includes('<html')) {
          console.log(`   ⚠️  Servidor devolviendo página HTML en lugar de JSON`)
        }
        
      } else if (response.statusCode === 404) {
        console.log(`   🔍 Error 404: Endpoint no encontrado`)
      } else if (response.statusCode >= 500) {
        console.log(`   💥 Error del servidor: ${response.statusCode}`)
        console.log(`   📄 Respuesta: ${response.body.substring(0, 200)}`)
      } else {
        console.log(`   ⚠️  Respuesta inesperada: ${response.statusCode}`)
        console.log(`   📄 Cuerpo: ${response.body.substring(0, 200)}`)
      }
      
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`)
    }
    
    console.log('') // Línea en blanco
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Resumen y recomendaciones
  console.log('📋 RESUMEN Y RECOMENDACIONES:')
  console.log('')
  console.log('Si encuentras errores 403:')
  console.log('   1. Verificar configuración de nginx/apache')
  console.log('   2. Revisar reglas de firewall')
  console.log('   3. Verificar permisos de archivos')
  console.log('   4. Comprobar configuración de Next.js')
  console.log('')
  console.log('Si las APIs devuelven HTML en lugar de JSON:')
  console.log('   1. Problema de enrutamiento del servidor web')
  console.log('   2. Verificar configuración de proxy reverso')
  console.log('   3. Revisar configuración de Next.js build')
  console.log('   4. Comprobar variables de entorno en producción')
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testEndpoints()
    .then(() => {
      console.log('\n🎉 Test de endpoints completado')
    })
    .catch((error) => {
      console.error('\n💥 Error durante el test:', error.message)
    })
}

module.exports = { testEndpoints } 