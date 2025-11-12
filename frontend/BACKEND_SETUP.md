# Amazon Group - Backend Configuration

Esta guía explica cómo configurar el backend para trabajar con MongoDB y Cloudinary para la aplicación Amazon Group React Native.

## 📋 Requisitos

- Node.js 16+ 
- MongoDB 4.4+
- Cuenta en Cloudinary
- Cuenta en MercadoPago (opcional)   

## 🗄️ Configuración de MongoDB

### 1. Instalación local de MongoDB

```bash
# En Windows (con Chocolatey)
choco install mongodb

# En macOS (con Homebrew)
brew install mongodb-community

# En Ubuntu/Debian
sudo apt-get install mongodb
```

### 2. Iniciar MongoDB

```bash
# Iniciar servicio MongoDB
mongod

# O usar MongoDB Compass para interfaz gráfica
```

### 3. Crear base de datos

```javascript
// Conectarse a MongoDB
use amazon_group

// Crear colecciones principales
db.createCollection("users")
db.createCollection("services") 
db.createCollection("categories")
db.createCollection("orders")
db.createCollection("reviews")
```

## 🔧 Estructura del Backend

### Dependencias principales del package.json

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cloudinary": "^1.41.0",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "nodemailer": "^6.9.4",
    "mercadopago": "^1.5.17",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0"
  }
}
```

### Variables de entorno (.env del backend)

```bash
# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/amazon_group
# Para MongoDB Atlas: mongodb+srv://usuario:password@cluster.mongodb.net/amazon_group

# JWT
JWT_SECRET=tu_clave_jwt_super_secreta_aqui_minimo_32_caracteres
JWT_EXPIRES_IN=7d

# Cloudinary para imágenes
CLOUDINARY_CLOUD_NAME=tu_cloudinary_cloud_name
CLOUDINARY_API_KEY=tu_cloudinary_api_key
CLOUDINARY_API_SECRET=tu_cloudinary_api_secret

# Email (para recuperación de contraseña)
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion_google

# MercadoPago (pagos)
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_access_token

# Configuración del servidor
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:8081,exp://192.168.1.100:8081
```

## 📊 Esquemas de MongoDB

### Usuario (User)

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String }, // URL de Cloudinary
  role: { 
    type: String, 
    enum: ['client', 'affiliate', 'admin'], 
    default: 'client' 
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  // Datos específicos de afiliado
  affiliateData: {
    businessName: { type: String },
    description: { type: String },
    documents: [{
      type: { type: String }, // 'cedula', 'rut', etc.
      url: { type: String },  // URL de Cloudinary
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }],
    isApproved: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});
```

### Servicio (Service)

```javascript
const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  images: [{ 
    url: { type: String },      // URL de Cloudinary
    publicId: { type: String }  // Public ID de Cloudinary para eliminar
  }],
  
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  availability: {
    days: [{ type: String }], // ['monday', 'tuesday', etc.]
    hours: {
      start: { type: String }, // '09:00'
      end: { type: String }    // '18:00'
    }
  },
  
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  tags: [{ type: String }]
}, {
  timestamps: true
});
```

### Categoría (Category)

```javascript
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String }, // Nombre del icono
  color: { type: String }, // Color hexadecimal
  image: { 
    url: { type: String },
    publicId: { type: String }
  },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});
```

### Pedido (Order)

```javascript
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  scheduledDate: { type: Date },
  completedDate: { type: Date },
  
  pricing: {
    subtotal: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  
  payment: {
    method: { type: String }, // 'mercadopago', 'cash', etc.
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: { type: String },
    paidAt: { type: Date }
  },
  
  notes: { type: String },
  clientNotes: { type: String },
  providerNotes: { type: String }
}, {
  timestamps: true
});
```

## ☁️ Configuración de Cloudinary

### 1. Crear cuenta en Cloudinary

1. Ir a [cloudinary.com](https://cloudinary.com)
2. Crear cuenta gratuita
3. Obtener: Cloud Name, API Key, API Secret

### 2. Configurar upload presets

En el dashboard de Cloudinary:

```javascript
// Upload Preset: amazon_group_preset
{
  "upload_preset": "amazon_group_preset",
  "unsigned": false,
  "folder": "amazon_group/images",
  "allowed_formats": ["jpg", "jpeg", "png", "webp"],
  "transformation": [
    {"quality": "auto:good"},
    {"fetch_format": "auto"}
  ],
  "max_file_size": 5000000
}

// Upload Preset: amazon_group_documents  
{
  "upload_preset": "amazon_group_documents",
  "unsigned": false,
  "folder": "amazon_group/documents", 
  "allowed_formats": ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
  "max_file_size": 10000000
}
```

### 3. Código de configuración Cloudinary (backend)

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

## 🚀 Endpoints principales del API

### Autenticación

```javascript
// POST /api/users/register
// POST /api/users/login
// POST /api/users/oauth/google
// GET /api/users/me
// PATCH /api/users/me
// POST /api/users/forgot-password
// POST /api/users/reset-password
```

### Uploads

```javascript
// POST /api/uploads/image
// POST /api/uploads/document
// DELETE /api/uploads/delete
```

### Servicios

```javascript
// GET /api/services
// POST /api/services
// GET /api/services/:id
// PATCH /api/services/:id
// DELETE /api/services/:id
```

### Categorías

```javascript
// GET /api/categories
// POST /api/categories (admin)
// PATCH /api/categories/:id (admin)
// DELETE /api/categories/:id (admin)
```

### Pedidos

```javascript
// GET /api/orders
// POST /api/orders
// GET /api/orders/:id
// PATCH /api/orders/:id/status
// GET /api/orders/:id/invoice
```

## 📝 Ejemplo de controlador de upload

```javascript
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'amazon_group/images',
        upload_preset: 'amazon_group_preset',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          return res.status(400).json({ message: 'Error al subir imagen' });
        }
        
        res.json({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { uploadImage };
```

## 🔐 Middleware de autenticación

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = auth;
```

## 🚀 Iniciar el servidor

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar en desarrollo
npm run dev

# O iniciar en producción
npm start
```

## 🔍 Testing

### Probar conexión a MongoDB

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.log('❌ Error de conexión:', err));
```

### Probar uploads a Cloudinary

```bash
# Usar Postman o curl
curl -X POST http://localhost:5000/api/uploads/image \
  -H "Authorization: Bearer tu_jwt_token" \
  -F "image=@path/to/image.jpg"
```

## 📚 Recursos adicionales

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [MercadoPago API](https://www.mercadopago.com.mx/developers)

## 🆘 Solución de problemas comunes

### Error de conexión MongoDB
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# O iniciar MongoDB
sudo systemctl start mongod
```

### Error de Cloudinary
- Verificar que las credenciales sean correctas
- Verificar que los upload presets estén configurados
- Verificar límites de la cuenta gratuita

### Error de CORS
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
}));
```

Con esta configuración, tu backend estará listo para manejar toda la funcionalidad de la aplicación React Native con MongoDB y Cloudinary.