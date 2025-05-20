// setup-db.js
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Configuración de la conexión
const config = {
  server: process.env.SQL_DB_HOST || "177.54.146.73",
  database: process.env.SQL_DB_NAME || "_obj",
  user: process.env.SQL_DB_USER || "sa2",
  password: process.env.SQL_DB_PASS || "qA83<tkA3<|6",
  port: parseInt(process.env.SQL_DB_PORT || "1433"),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function setupDatabase() {
  console.log('Iniciando configuración de la base de datos...');
  console.log('Usando configuración:', {
    server: config.server,
    database: config.database,
    user: config.user,
    port: config.port
  });
  
  try {
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'setup-recovery.sql');
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Conectando a la base de datos...');
    await sql.connect(config);
    console.log('Conexión exitosa');
    
    console.log('Ejecutando script SQL...');
    const result = await sql.query(sqlQuery);
    console.log('Script SQL ejecutado con éxito');
    
    // Mostrar los resultados
    if (result.recordsets && result.recordsets.length > 0) {
      console.log('Resultados:');
      console.log(result.recordsets[result.recordsets.length - 1]);
    }
    
    await sql.close();
    console.log('Conexión cerrada');
  } catch (err) {
    console.error('Error al configurar la base de datos:', err);
    
    // Intentar cerrar la conexión si hay un error
    try {
      await sql.close();
    } catch (closeErr) {
      console.error('Error al cerrar la conexión:', closeErr);
    }
  }
}

setupDatabase(); 