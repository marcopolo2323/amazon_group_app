/**
 * Script de prueba para verificar la configuración de Google OAuth
 * Ejecutar con: node test-google-oauth.js
 */

require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

async function testGoogleOAuth() {
  console.log('\n=== Test de Google OAuth ===\n');
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientIds = process.env.GOOGLE_CLIENT_IDS;
  
  if (!clientId && !clientIds) {
    console.error('✗ GOOGLE_CLIENT_ID no está configurado en .env');
    console.error('\nPara configurar Google OAuth:');
    console.error('1. Ve a https://console.cloud.google.com/');
    console.error('2. Crea un proyecto o selecciona uno existente');
    console.error('3. Habilita la API de Google+ o Google Identity');
    console.error('4. Ve a "Credenciales" y crea un "ID de cliente de OAuth 2.0"');
    console.error('5. Configura los orígenes autorizados y URIs de redirección');
    console.error('6. Copia el Client ID y agrégalo a tu .env');
    process.exit(1);
  }
  
  const ids = (clientIds || clientId).split(',').map(s => s.trim()).filter(Boolean);
  
  console.log('✓ GOOGLE_CLIENT_ID(s) encontrado(s):');
  ids.forEach((id, index) => {
    console.log(`  ${index + 1}. ${id.substring(0, 30)}...`);
  });
  
  try {
    const client = new OAuth2Client();
    console.log('\n✓ Cliente de Google OAuth inicializado');
    
    console.log('\n=== Configuración ===');
    console.log('Client IDs configurados:', ids.length);
    console.log('\nPara probar el login con Google:');
    console.log('1. Asegúrate de que tu aplicación frontend esté configurada con el mismo Client ID');
    console.log('2. El Client ID debe estar autorizado para tu dominio/origen');
    console.log('3. En Google Cloud Console, verifica:');
    console.log('   - Orígenes autorizados de JavaScript:');
    console.log('     * http://localhost:8081');
    console.log('     * http://localhost:3000');
    console.log('     * Tu dominio de producción');
    console.log('   - URIs de redirección autorizados:');
    console.log('     * http://localhost:8081');
    console.log('     * http://localhost:3000');
    console.log('     * Tu dominio de producción');
    
    console.log('\n✓ La configuración básica de Google OAuth está presente');
    console.log('\nNOTA: Para verificar completamente, necesitas probar desde tu aplicación frontend');
    console.log('      con un token de ID real generado por Google Sign-In.');
    
  } catch (error) {
    console.error('\n✗ Error al inicializar Google OAuth:');
    console.error('  Mensaje:', error.message);
    process.exit(1);
  }
}

testGoogleOAuth();
