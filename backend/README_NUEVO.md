# 🚀 Amazon Group Backend - MongoDB Atlas

Backend API para la plataforma Amazon Group, conectado a MongoDB Atlas con todas las colecciones y datos de prueba.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Comandos Disponibles](#comandos-disponibles)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [API Endpoints](#api-endpoints)
- [Documentación Adicional](#documentación-adicional)

---

## 📦 Requisitos

- **Node.js:** 18 o superior (< 23)
- **MongoDB Atlas:** Cuenta configurada
- **npm:** 8 o superior

---

## 🔧 Instalación

1. **Navegar al directorio backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   # Copiar el archivo de ejemplo
   cp .env.example .env
   
   # Editar .env con tus credenciales
   ```

4. **Poblar la base de datos:**
   ```bash
   npm run seed
   ```

5. **Verificar la configuración:**
   ```bash
   npm run check
   ```

6. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

---

## ⚙️ Configuración

### Variables de Entorno Requeridas

Crea un archivo `.env` en el directorio `backend` con las siguientes variables:

```env
# Servidor
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/amazon?retryWrites=true&w=majority&appName=amazon

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_minimo_32_caracteres
JWT_EXPIRES_IN=7d

# Cloudinary (para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# MercadoPago (para pagos)
MP_ACCESS_TOKEN=APP_USR-tu-access-token
MP_CURRENCY_ID=PEN

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# Admin
ADMIN_EMAIL=admin@amazongroup.com
ADMIN_PASSWORD=admin123456
```

### Obtener Credenciales

#### MongoDB Atlas
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito
3. Configurar usuario y contraseña
4. Agregar tu IP a la whitelist
5. Obtener la connection string

#### Google OAuth
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un proyecto
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Copiar el Client ID

#### MercadoPago
1. Crear cuenta en [MercadoPago Developers](https://www.mercadopago.com.pe/developers)
2. Ir a "Tus integraciones"
3. Crear una aplicación
4. Copiar el Access Token de prueba o producción

#### Cloudinary
1. Crear cuenta en [Cloudinary](https://cloudinary.com/)
2. Ir al Dashboard
3. Copiar Cloud Name, API Key y API Secret

---

## 🎮 Comandos Disponibles

### Desarrollo
```bash
# Iniciar servidor de desarrollo (con hot-reload)
npm run dev

# Iniciar servidor de producción
npm start
```

### Base de Datos
```bash
# Poblar la base de datos con datos de prueba
npm run seed

# Verificar estado de la base de datos
npm run verify:db

# Verificar configuración completa
npm run check
```

### Testing
```bash
# Verificar configuración de Google OAuth
npm run test:google

# Verificar configuración de MercadoPago
npm run test:mercadopago

# Verificar endpoint de pagos
npm run test:payment-endpoint

# Verificar todas las configuraciones
npm run test:config
```

---

## 🗄️ Estructura de la Base de Datos

### Colecciones

| Colección | Descripción | Documentos |
|-----------|-------------|------------|
| **categories** | Categorías de servicios | 12 |
| **users** | Usuarios (clientes, afiliados, admin) | 8 |
| **affiliates** | Perfiles de afiliados | 4 |
| **services** | Servicios publicados | 8 |
| **orders** | Órdenes de compra | 6 |
| **transactions** | Transacciones de pago | 5 |
| **reviews** | Reseñas de servicios | 8 |
| **notifications** | Notificaciones de usuarios | 5 |
| **disputes** | Disputas y reclamos | 1 |
| **affiliatepayments** | Pagos a afiliados | 2 |

### Modelos Principales

#### User
```javascript
{
  role: 'client' | 'affiliate' | 'admin',
  name: String,
  email: String (unique),
  phone: String,
  avatar: String,
  bio: String,
  password: String (hashed),
  googleId: String,
  resetCode: String,
  resetCodeExp: Date
}
```

#### Service
```javascript
{
  affiliateId: ObjectId (ref: User),
  category: String,
  title: String,
  description: String,
  price: Number,
  currency: String,
  images: [String],
  features: [String],
  location: {
    lat: Number,
    lng: Number,
    address: String,
    city: String
  },
  availability: {
    days: [String],
    startTime: String,
    endTime: String
  },
  status: 'active' | 'inactive' | 'sold'
}
```

#### Order
```javascript
{
  clientId: ObjectId (ref: User),
  serviceId: ObjectId (ref: Service),
  affiliateId: ObjectId (ref: User),
  amount: Number,
  commission: Number,
  paymentMethod: String,
  paymentStatus: 'pending' | 'completed' | 'failed',
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
  scheduledDate: Date,
  address: String,
  contactInfo: {
    name: String,
    phone: String,
    email: String
  }
}
```

---

## 🔐 Credenciales de Prueba

### Admin
- **Email:** admin@amazongroup.com
- **Password:** admin123

### Clientes
- **Email:** ana.garcia@example.com | **Password:** 123456
- **Email:** carlos.mendoza@example.com | **Password:** 123456
- **Email:** laura.perez@example.com | **Password:** 123456

### Afiliados
- **Email:** maria.gonzalez@example.com | **Password:** 123456 (✅ Aprobado)
- **Email:** jose.rodriguez@example.com | **Password:** 123456 (✅ Aprobado)
- **Email:** carmen.lopez@example.com | **Password:** 123456 (✅ Aprobado)
- **Email:** roberto.silva@example.com | **Password:** 123456 (⏳ Pendiente)

---

## 🌐 API Endpoints

### Autenticación
```
POST   /api/auth/register          - Registrar usuario
POST   /api/auth/login             - Iniciar sesión
POST   /api/auth/google            - Login con Google
POST   /api/auth/forgot-password   - Recuperar contraseña
POST   /api/auth/reset-password    - Restablecer contraseña
GET    /api/auth/me                - Obtener usuario actual
```

### Usuarios
```
GET    /api/users                  - Listar usuarios (admin)
GET    /api/users/:id              - Obtener usuario
PUT    /api/users/:id              - Actualizar usuario
DELETE /api/users/:id              - Eliminar usuario (admin)
```

### Servicios
```
GET    /api/services               - Listar servicios
GET    /api/services/:id           - Obtener servicio
POST   /api/services               - Crear servicio (affiliate)
PUT    /api/services/:id           - Actualizar servicio
DELETE /api/services/:id           - Eliminar servicio
GET    /api/services/category/:cat - Servicios por categoría
```

### Órdenes
```
GET    /api/orders                 - Listar órdenes
GET    /api/orders/:id             - Obtener orden
POST   /api/orders                 - Crear orden
PUT    /api/orders/:id             - Actualizar orden
DELETE /api/orders/:id             - Cancelar orden
```

### Categorías
```
GET    /api/categories             - Listar categorías
GET    /api/categories/:id         - Obtener categoría
POST   /api/categories             - Crear categoría (admin)
PUT    /api/categories/:id         - Actualizar categoría (admin)
DELETE /api/categories/:id         - Eliminar categoría (admin)
```

### Reseñas
```
GET    /api/reviews                - Listar reseñas
GET    /api/reviews/service/:id    - Reseñas de un servicio
POST   /api/reviews                - Crear reseña
PUT    /api/reviews/:id            - Actualizar reseña
DELETE /api/reviews/:id            - Eliminar reseña
```

### Notificaciones
```
GET    /api/notifications          - Listar notificaciones
GET    /api/notifications/:id      - Obtener notificación
PUT    /api/notifications/:id/read - Marcar como leída
DELETE /api/notifications/:id      - Eliminar notificación
```

### Pagos
```
POST   /api/payments/create        - Crear pago con MercadoPago
POST   /api/payments/webhook       - Webhook de MercadoPago
GET    /api/payments/:id           - Obtener estado de pago
```

---

## 📚 Documentación Adicional

- **[SEED_ACTUALIZADO.md](./SEED_ACTUALIZADO.md)** - Guía completa del seed
- **[RESUMEN_ACTUALIZACION_MONGODB.md](./RESUMEN_ACTUALIZACION_MONGODB.md)** - Resumen de cambios
- **[INICIO_RAPIDO_MONGODB.txt](./INICIO_RAPIDO_MONGODB.txt)** - Guía de inicio rápido
- **[CREDENTIALS.md](./CREDENTIALS.md)** - Configuración de credenciales
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solución de problemas

---

## 🔍 Verificación del Sistema

### Verificar Configuración
```bash
npm run check
```

Este comando verifica:
- ✅ Existencia del archivo .env
- ✅ Variables de entorno requeridas
- ✅ Conexión a MongoDB Atlas
- ✅ Colecciones en la base de datos
- ✅ Datos en las colecciones
- ✅ Configuraciones opcionales

### Verificar Base de Datos
```bash
npm run verify:db
```

Este comando muestra:
- 📊 Estadísticas de todas las colecciones
- 👥 Desglose de usuarios por rol
- 🏢 Estado de afiliados
- 📦 Estado de órdenes
- 💰 Estadísticas financieras
- ⭐ Servicios más valorados

---

## 🐛 Solución de Problemas

### Error de Conexión a MongoDB
```bash
# Verificar que el MONGODB_URI sea correcto
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI);"

# Probar conexión
npm run check
```

### Base de Datos Vacía
```bash
# Poblar la base de datos
npm run seed

# Verificar datos
npm run verify:db
```

### Puerto en Uso
```bash
# Cambiar el puerto en .env
PORT=5001

# O matar el proceso que usa el puerto 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Dependencias Faltantes
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Estadísticas Actuales

```
📁 Categorías:           12
👥 Usuarios:             8
🏢 Afiliados:            4
🛍️  Servicios:            8
📦 Órdenes:              6
💳 Transacciones:        5
⭐ Reseñas:              8
🔔 Notificaciones:       5
⚠️  Disputas:             1
💰 Pagos a Afiliados:    2

Total: 59 documentos
```

---

## 🚀 Despliegue

### Render.com
1. Crear cuenta en [Render](https://render.com/)
2. Conectar repositorio de GitHub
3. Configurar variables de entorno
4. Desplegar

### Heroku
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Crear app
heroku create amazon-group-backend

# Configurar variables de entorno
heroku config:set MONGODB_URI=tu_uri
heroku config:set JWT_SECRET=tu_secret

# Desplegar
git push heroku main
```

---

## 📝 Licencia

ISC

---

## 👥 Equipo

Amazon Group Development Team

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa la [documentación de solución de problemas](./TROUBLESHOOTING.md)
2. Ejecuta `npm run check` para verificar la configuración
3. Revisa los logs del servidor
4. Contacta al equipo de desarrollo

---

**Última actualización:** 17 de noviembre de 2025
