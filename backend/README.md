Backend API

Requisitos
- Node 18+
- MongoDB en ejecución (local o Atlas)

Instalación
1. Ir a `backend`
2. `npm install`

Variables de entorno (crear archivo `.env` en `backend`)
Ejemplo:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/amazon_group
JWT_SECRET=cambia_esto
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120

# Google OAuth (requerido para Login con Google)
# Obtén el Client ID desde Google Cloud Console
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=tu_client_id_web.apps.googleusercontent.com
GOOGLE_CLIENT_IDS=tu_client_id_web.apps.googleusercontent.com

# MercadoPago (requerido para pagos)
# Obtén el Access Token desde MercadoPago Developers
# https://www.mercadopago.com.pe/developers/panel/credentials
MP_ACCESS_TOKEN=APP_USR-tu-access-token-aqui
MP_CURRENCY_ID=PEN

# SMTP (opcional). Si no se configura, los correos se registran en consola
# SMTP_HOST=smtp.tudominio.com
# SMTP_PORT=587
# SMTP_USER=usuario
# SMTP_PASS=contraseña
# SMTP_SECURE=false
# SMTP_FROM="Soporte <no-reply@tudominio.com>"
```

Scripts
- `npm run dev`: inicia con nodemon (desarrollo)
- `npm start`: inicia en producción

Ejecución
1. Configura `.env`
2. `npm run dev`
3. Visita `http://localhost:4000/api/health`

API (resumen)
- GET /api/health
- POST /api/users/register
- POST /api/users/login
- POST /api/users/oauth/google
- POST /api/users/forgot-password
- POST /api/users/reset-password
- GET /api/users (auth + role affiliate)
- POST /api/affiliates (auth + role affiliate)
- GET /api/affiliates (auth + role affiliate)
- POST /api/services (auth)
- GET /api/services
- POST /api/orders (auth)
- GET /api/orders (auth)
- POST /api/transactions (auth + role affiliate)
- GET /api/transactions (auth + role affiliate)
- POST /api/categories (auth + role affiliate)
- GET /api/categories

Notas
- Modelos Mongoose siguiendo el esquema solicitado.
- Contraseñas con hash (bcrypt) y JWT para auth.

