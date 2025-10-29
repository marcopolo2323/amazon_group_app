const { Router } = require('express');

const router = Router();

function htmlPage({ title, heading, message, extra }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; margin: 0; padding: 2rem; background: #f7fafc; color: #1a202c; }
      .card { max-width: 680px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,0.08); padding: 2rem; }
      h1 { font-size: 1.5rem; margin-top: 0; }
      .meta { color: #4a5568; margin: 0.75rem 0 1.25rem; }
      .btn { display: inline-block; padding: 0.75rem 1rem; border-radius: 8px; background: #1a73e8; color: white; text-decoration: none; }
      .btn:hover { background: #1558b0; }
      footer { margin-top: 2rem; font-size: 0.875rem; color: #718096; }
      code { background: #edf2f7; padding: 0.2rem 0.4rem; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${heading}</h1>
      <p class="meta">${message}</p>
      ${extra || ''}
      <footer>
        Puedes cerrar esta página y volver a la app.
      </footer>
    </div>
  </body>
</html>`;
}

// Página principal
router.get('/', (req, res) => {
  const title = 'Amazon Group - Backend';
  const heading = 'Amazon Group API';
  const message = `
    Esta es la API de Amazon Group. Consulta las páginas públicas:
    <ul>
      <li><a href="/privacy">Política de privacidad</a></li>
      <li><a href="/terms">Términos y condiciones</a></li>
      <li><a href="/health">Estado del servidor</a></li>
    </ul>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(htmlPage({ title, heading, message }));
});

// Política de privacidad
router.get('/privacy', (req, res) => {
  const title = 'Política de privacidad';
  const heading = 'Política de privacidad de Amazon Group';
  const message = `
    Esta aplicación recopila datos necesarios para la prestación del servicio (nombre, correo, teléfono) y
    para el procesamiento de pagos y verificación de identidad de afiliados.
    No compartimos datos con terceros salvo los estrictamente necesarios para operar (proveedores de pago,
    almacenamiento de imágenes y autenticación). Puedes solicitar la eliminación de tus datos escribiendo a
    <strong>${process.env.SUPPORT_EMAIL || 'support@amazongroup.com'}</strong>.
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(htmlPage({ title, heading, message }));
});

// Términos y condiciones
router.get('/terms', (req, res) => {
  const title = 'Términos y condiciones';
  const heading = 'Términos y condiciones del servicio';
  const message = `
    Al usar esta aplicación aceptas: (1) proporcionar información veraz, (2) cumplir con las políticas de uso
    aceptable, (3) respetar las condiciones de pago, reembolsos y cancelaciones establecidas por los proveedores
    y por la plataforma. La aplicación puede actualizar estos términos; el uso continuo implica aceptación.
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(htmlPage({ title, heading, message }));
});

router.get('/order-confirmation', (req, res) => {
  const orderId = req.query.orderId || '';
  const success = req.query.success === 'true';
  const statusText = success ? 'Pago aprobado' : 'Pago pendiente';
  const title = 'Confirmación de orden';
  const heading = success ? '¡Gracias! Tu orden fue creada.' : 'Tu orden fue creada, pago pendiente';
  const message = `Estado del pago: <strong>${statusText}</strong><br/>Número de orden: <code>${orderId}</code>`;
  const extra = `<a class="btn" href="/health">Comprobar estado del servidor</a>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(htmlPage({ title, heading, message, extra }));
});

router.get('/payment-failure', (req, res) => {
  const orderId = req.query.orderId || '';
  const title = 'Pago fallido';
  const heading = 'No se pudo procesar tu pago';
  const message = `Intenta nuevamente desde la app.<br/>Número de orden: <code>${orderId}</code>`;
  const extra = `<a class="btn" href="/health">Comprobar estado del servidor</a>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(htmlPage({ title, heading, message, extra }));
});

module.exports = router;