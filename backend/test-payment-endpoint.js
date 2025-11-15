/**
 * Script para probar el endpoint de pagos de MercadoPago
 * Simula una llamada real al endpoint
 */

require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');

async function testPaymentEndpoint() {
  console.log('\n=== Test del Endpoint de Pagos ===\n');
  
  const accessToken = process.env.MP_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('✗ MP_ACCESS_TOKEN no está configurado');
    process.exit(1);
  }
  
  try {
    // Simular lo que hace el endpoint
    const client = new MercadoPagoConfig({ 
      accessToken,
      options: { timeout: 10000 }
    });
    const mpPreference = new Preference(client);
    
    const preference = {
      items: [
        {
          title: 'Servicio de Prueba',
          quantity: 1,
          currency_id: process.env.MP_CURRENCY_ID || 'PEN',
          unit_price: 100,
        },
      ],
      external_reference: 'test-order-' + Date.now(),
      back_urls: {
        success: 'http://localhost:8081/order-confirmation?orderId=test&success=true',
        pending: 'http://localhost:8081/order-confirmation?orderId=test',
        failure: 'http://localhost:8081/payment-failure?orderId=test',
      },
    };
    
    console.log('Creando preferencia...\n');
    const response = await mpPreference.create({ body: preference });
    
    // El SDK v2 puede devolver la respuesta en body o directamente
    const data = response.body || response;
    
    console.log('✓ Respuesta de MercadoPago:\n');
    console.log('  ID:', data.id);
    console.log('  Init Point:', data.init_point || '❌ NO DISPONIBLE');
    console.log('  Sandbox Init Point:', data.sandbox_init_point || '❌ NO DISPONIBLE');
    console.log('  External Reference:', preference.external_reference);
    
    // Simular lo que devuelve el endpoint
    const checkoutBase = 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=';
    const url = data.init_point || data.sandbox_init_point || (data.id ? `${checkoutBase}${encodeURIComponent(data.id)}` : undefined);
    
    const endpointResponse = {
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      preference_id: data.id,
      external_reference: preference.external_reference,
      url
    };
    
    console.log('\n✓ Lo que devolvería el endpoint:\n');
    console.log(JSON.stringify(endpointResponse, null, 2));
    
    if (!endpointResponse.init_point && !endpointResponse.sandbox_init_point && !endpointResponse.url) {
      console.log('\n❌ ERROR: No se generó ninguna URL de pago');
      console.log('   Esto significa que el frontend no podrá abrir el link de pago');
      process.exit(1);
    }
    
    console.log('\n✅ ¡El endpoint devolvería correctamente la URL de pago!');
    console.log('\nURL que se abriría en el navegador:');
    console.log(url);
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    if (error.cause) {
      console.error('  Causa:', JSON.stringify(error.cause, null, 2));
    }
    process.exit(1);
  }
}

testPaymentEndpoint();
