/**
 * Script completo de verificación del backend
 * Ejecuta todas las pruebas y muestra un resumen
 */

require('dotenv').config();
const { runDiagnostics } = require('./src/utils/diagnostics');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     Verificación Completa del Backend Amazon Group     ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Ejecutar diagnóstico
const results = runDiagnostics();

// Pruebas adicionales
console.log('\n=== Pruebas Adicionales ===\n');

// Test de Google OAuth
console.log('🔍 Probando Google OAuth...');
try {
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client();
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientIds = process.env.GOOGLE_CLIENT_IDS;
  
  if (!clientId && !clientIds) {
    console.log('  ✗ Google OAuth: No configurado');
  } else {
    console.log('  ✓ Google OAuth: SDK inicializado correctamente');
    console.log('    Para probar completamente, ejecuta: npm run test:google');
  }
} catch (error) {
  console.log('  ✗ Google OAuth: Error al inicializar -', error.message);
}

// Test de MercadoPago
console.log('\n🔍 Probando MercadoPago...');
try {
  const { MercadoPagoConfig } = require('mercadopago');
  
  const accessToken = process.env.MP_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log('  ✗ MercadoPago: No configurado');
  } else {
    const client = new MercadoPagoConfig({ accessToken });
    console.log('  ✓ MercadoPago: SDK inicializado correctamente');
    console.log('    Para probar completamente, ejecuta: npm run test:mercadopago');
  }
} catch (error) {
  console.log('  ✗ MercadoPago: Error al inicializar -', error.message);
}

// Test de MongoDB
console.log('\n🔍 Probando MongoDB...');
const mongoose = require('mongoose');
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.log('  ✗ MongoDB: URI no configurado');
} else {
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('  ✓ MongoDB: Conexión exitosa');
      mongoose.connection.close();
      
      // Resumen final
      printFinalSummary(results);
    })
    .catch((error) => {
      console.log('  ✗ MongoDB: Error de conexión -', error.message);
      
      // Resumen final
      printFinalSummary(results);
    });
}

function printFinalSummary(results) {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    Resumen Final                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const allCritical = results.database && results.google && results.mercadopago;
  
  if (allCritical) {
    console.log('✅ ¡Todo está configurado correctamente!\n');
    console.log('Próximos pasos:');
    console.log('1. Inicia el servidor: npm run dev');
    console.log('2. Prueba login con Google desde tu app');
    console.log('3. Prueba crear un pago con MercadoPago');
    console.log('4. Revisa los logs del servidor si algo falla\n');
  } else {
    console.log('⚠️  Hay configuraciones faltantes o incorrectas\n');
    console.log('Revisa los errores arriba y:');
    console.log('1. Verifica tu archivo .env');
    console.log('2. Consulta TROUBLESHOOTING.md para ayuda detallada');
    console.log('3. Ejecuta los tests específicos:');
    console.log('   - npm run test:google');
    console.log('   - npm run test:mercadopago\n');
  }
  
  console.log('📚 Documentación disponible:');
  console.log('   - RESUMEN_CAMBIOS.md: Qué se cambió y por qué');
  console.log('   - SOLUCION_PROBLEMAS.md: Guía rápida de solución');
  console.log('   - TROUBLESHOOTING.md: Guía detallada de problemas\n');
  
  process.exit(allCritical ? 0 : 1);
}
