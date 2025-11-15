/**
 * Script de prueba para verificar las credenciales de MercadoPago
 * Ejecutar con: node test-mercadopago.js
 */

require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');

async function testMercadoPago() {
  console.log('\n=== Test de MercadoPago ===\n');
  
  const accessToken = process.env.MP_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('✗ MP_ACCESS_TOKEN no está configurado en .env');
    process.exit(1);
  }
  
  console.log('✓ MP_ACCESS_TOKEN encontrado:', accessToken.substring(0, 20) + '...');
  
  try {
    // Inicializar cliente
    const client = new MercadoPagoConfig({ 
      accessToken: accessToken,
      options: { timeout: 5000 }
    });
    
    console.log('✓ Cliente de MercadoPago inicializado');
    
    // Crear una preferencia de prueba
    const preference = new Preference(client);
    
    const testPreference = {
      items: [
        {
          title: 'Test Product',
          quantity: 1,
          currency_id: process.env.MP_CURRENCY_ID || 'PEN',
          unit_price: 100,
        },
      ],
      external_reference: 'test-' + Date.now(),
      back_urls: {
        success: 'http://localhost:5000/success',
        pending: 'http://localhost:5000/pending',
        failure: 'http://localhost:5000/failure',
      },
    };
    
    console.log('\nCreando preferencia de prueba...');
    const response = await preference.create({ body: testPreference });
    
    console.log('\n✓ ¡Preferencia creada exitosamente!');
    
    // El SDK v2 devuelve la respuesta directamente, no en response.body
    const data = response.body || response;
    
    console.log('  ID:', data.id);
    console.log('  Init Point:', data.init_point || 'N/A');
    console.log('  Sandbox Init Point:', data.sandbox_init_point || 'N/A');
    
    console.log('\n✓ Las credenciales de MercadoPago son válidas');
    console.log('\nPuedes usar este enlace para probar el pago:');
    console.log(data.init_point || data.sandbox_init_point);
    
  } catch (error) {
    console.error('\n✗ Error al probar MercadoPago:');
    console.error('  Mensaje:', error.message);
    
    if (error.cause) {
      console.error('  Causa:', JSON.stringify(error.cause, null, 2));
    }
    
    if (error.statusCode === 401) {
      console.error('\n  El token de acceso no es válido o ha expirado.');
      console.error('  Verifica que estés usando el Access Token correcto de tu cuenta de MercadoPago.');
      console.error('  Puedes obtenerlo en: https://www.mercadopago.com.pe/developers/panel/credentials');
    } else if (error.statusCode === 400) {
      console.error('\n  Error en la solicitud. Verifica los datos enviados.');
    }
    
    process.exit(1);
  }
}

testMercadoPago();
