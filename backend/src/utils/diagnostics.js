/**
 * Utilidad de diagnóstico para verificar la configuración del backend
 */

function checkGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientIds = process.env.GOOGLE_CLIENT_IDS;
  
  console.log('\n=== Google OAuth Configuration ===');
  
  if (!clientId && !clientIds) {
    console.error('✗ GOOGLE_CLIENT_ID no está configurado');
    return false;
  }
  
  console.log('✓ GOOGLE_CLIENT_ID:', clientId ? `${clientId.substring(0, 20)}...` : 'No configurado');
  console.log('✓ GOOGLE_CLIENT_IDS:', clientIds ? `${clientIds.substring(0, 20)}...` : 'No configurado');
  
  return true;
}

function checkMercadoPagoConfig() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const currencyId = process.env.MP_CURRENCY_ID;
  
  console.log('\n=== MercadoPago Configuration ===');
  
  if (!accessToken) {
    console.error('✗ MP_ACCESS_TOKEN no está configurado');
    return false;
  }
  
  console.log('✓ MP_ACCESS_TOKEN:', accessToken ? `${accessToken.substring(0, 20)}...` : 'No configurado');
  console.log('✓ MP_CURRENCY_ID:', currencyId || 'PEN (default)');
  
  // Verificar formato del token
  if (!accessToken.startsWith('APP_USR-')) {
    console.warn('⚠ El token de MercadoPago no tiene el formato esperado (APP_USR-...)');
    console.warn('  Asegúrate de usar el Access Token de producción o sandbox');
  }
  
  return true;
}

function checkEmailConfig() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  console.log('\n=== Email Configuration ===');
  
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('⚠ Configuración de email incompleta (los correos se registrarán en consola)');
    return false;
  }
  
  console.log('✓ SMTP_HOST:', smtpHost);
  console.log('✓ SMTP_USER:', smtpUser);
  console.log('✓ SMTP_PASS:', smtpPass ? '***' : 'No configurado');
  
  return true;
}

function checkDatabaseConfig() {
  const mongoUri = process.env.MONGODB_URI;
  
  console.log('\n=== Database Configuration ===');
  
  if (!mongoUri) {
    console.error('✗ MONGODB_URI no está configurado');
    return false;
  }
  
  // Ocultar credenciales en el log
  const sanitizedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log('✓ MONGODB_URI:', sanitizedUri);
  
  return true;
}

function checkJWTConfig() {
  const jwtSecret = process.env.JWT_SECRET;
  
  console.log('\n=== JWT Configuration ===');
  
  if (!jwtSecret || jwtSecret === 'change_me') {
    console.warn('⚠ JWT_SECRET no está configurado o usa el valor por defecto');
    console.warn('  Cambia JWT_SECRET a un valor seguro en producción');
    return false;
  }
  
  console.log('✓ JWT_SECRET:', '***');
  console.log('✓ JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || '7d');
  
  return true;
}

function runDiagnostics() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Backend Configuration Diagnostics        ║');
  console.log('╚════════════════════════════════════════════╝');
  
  const results = {
    database: checkDatabaseConfig(),
    jwt: checkJWTConfig(),
    google: checkGoogleOAuthConfig(),
    mercadopago: checkMercadoPagoConfig(),
    email: checkEmailConfig(),
  };
  
  console.log('\n=== Summary ===');
  console.log('Database:', results.database ? '✓' : '✗');
  console.log('JWT:', results.jwt ? '✓' : '⚠');
  console.log('Google OAuth:', results.google ? '✓' : '✗');
  console.log('MercadoPago:', results.mercadopago ? '✓' : '✗');
  console.log('Email:', results.email ? '✓' : '⚠');
  
  const allCritical = results.database && results.google && results.mercadopago;
  
  if (allCritical) {
    console.log('\n✓ Todas las configuraciones críticas están presentes');
  } else {
    console.log('\n✗ Faltan configuraciones críticas. Revisa los errores arriba.');
  }
  
  console.log('\n');
  
  return results;
}

module.exports = { runDiagnostics };
