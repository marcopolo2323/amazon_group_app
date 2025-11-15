# 🚀 Backend Amazon Group - Guía Rápida

## ⚡ Inicio Rápido

### 1. Verificar Todo
```bash
npm run verify
```

Este comando verifica:
- ✅ Conexión a MongoDB
- ✅ Configuración de Google OAuth
- ✅ Configuración de MercadoPago
- ✅ Variables de entorno
- ✅ Todas las credenciales

### 2. Iniciar Servidor
```bash
npm run dev
```

El servidor mostrará un diagnóstico automático al iniciar.

---

## 🔧 Solución de Problemas

### ❌ Google Login no funciona

**Síntoma:** Error al intentar iniciar sesión con Google

**Solución rápida:**
```bash
npm run test:google
```

**Verifica:**
1. Que `GOOGLE_CLIENT_ID` esté en tu `.env`
2. Que el Client ID sea el mismo en frontend y backend
3. Que los orígenes estén autorizados en [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

**Orígenes que debes autorizar:**
- `http://localhost:8081`
- `http://localhost:3000`
- Tu dominio de producción

---

### ❌ MercadoPago no funciona

**Síntoma:** Error al crear pagos o no se genera el link

**Solución rápida:**
```bash
npm run test:mercadopago
```

**Verifica:**
1. Que `MP_ACCESS_TOKEN` esté en tu `.env`
2. Que el token sea válido (no expirado)
3. Que tu cuenta de MercadoPago esté verificada

**Obtener token:**
1. Ve a [MercadoPago Developers](https://www.mercadopago.com.pe/developers/panel/credentials)
2. Copia el **Access Token** (Test o Production)
3. Pégalo en tu `.env`

**El token debe verse así:**
```
MP_ACCESS_TOKEN=APP_USR-3172047395939344-101611-2f27af5de30b055253b0f7e9fe94bc99-2925914622
```

---

## 📋 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run verify` | Verifica toda la configuración |
| `npm run dev` | Inicia servidor en modo desarrollo |
| `npm start` | Inicia servidor en producción |
| `npm run test:google` | Prueba Google OAuth |
| `npm run test:mercadopago` | Prueba MercadoPago |
| `npm run seed` | Carga datos de prueba |

---

## 📁 Archivos de Configuración

### `.env` (Principal)
Contiene todas las credenciales y configuración:
```env
# Base de datos
MONGODB_URI=tu-uri-de-mongodb

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_IDS=tu-client-id.apps.googleusercontent.com

# MercadoPago
MP_ACCESS_TOKEN=APP_USR-tu-token-aqui
MP_CURRENCY_ID=PEN

# JWT
JWT_SECRET=cambia-esto-en-produccion
```

### `.env.example`
Plantilla con todas las variables disponibles.

---

## 🔍 Diagnóstico

### Ver estado de configuración

**Opción 1: Al iniciar el servidor**
```bash
npm run dev
```

Verás:
```
╔════════════════════════════════════════════╗
║   Backend Configuration Diagnostics        ║
╚════════════════════════════════════════════╝

=== Database Configuration ===
✓ MONGODB_URI: mongodb+srv://...

=== Google OAuth Configuration ===
✓ GOOGLE_CLIENT_ID: 967582207282-...
✓ GOOGLE_CLIENT_IDS: 967582207282-...

=== MercadoPago Configuration ===
✓ MP_ACCESS_TOKEN: APP_USR-3172047...
✓ MP_CURRENCY_ID: PEN
```

**Opción 2: Verificación completa**
```bash
npm run verify
```

**Opción 3: Endpoint API (requiere ser admin)**
```bash
curl http://localhost:5000/api/config/check \
  -H "Authorization: Bearer tu-token-de-admin"
```

---

## 🐛 Errores Comunes

### Error: "Invalid Google token"
**Causa:** El Client ID del frontend no coincide con el del backend

**Solución:**
1. Verifica que ambos usen el mismo `GOOGLE_CLIENT_ID`
2. Revisa que el token no haya expirado
3. Asegúrate de que los orígenes estén autorizados

### Error: "MP_ACCESS_TOKEN no configurado"
**Causa:** Falta el token de MercadoPago en `.env`

**Solución:**
1. Ve a [MercadoPago Developers](https://www.mercadopago.com.pe/developers/panel/credentials)
2. Copia el Access Token
3. Agrégalo a tu `.env`

### Error: "MongoDB connection failed"
**Causa:** URI de MongoDB incorrecta o base de datos no accesible

**Solución:**
1. Verifica que `MONGODB_URI` esté correcta
2. Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
3. Verifica que las credenciales sean correctas

### Error 401 en MercadoPago
**Causa:** Token inválido o expirado

**Solución:**
1. Genera un nuevo token en MercadoPago Developers
2. Actualiza tu `.env`
3. Reinicia el servidor

---

## 📚 Documentación Completa

- **RESUMEN_CAMBIOS.md**: Qué se cambió y por qué
- **SOLUCION_PROBLEMAS.md**: Guía paso a paso de solución
- **TROUBLESHOOTING.md**: Guía detallada de problemas específicos
- **README.md**: Documentación técnica completa

---

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Ejecuté `npm run verify` sin errores
- [ ] El servidor inicia con `npm run dev` sin errores
- [ ] Veo ✓ en el diagnóstico de Google OAuth
- [ ] Veo ✓ en el diagnóstico de MercadoPago
- [ ] Mi `.env` tiene todas las variables necesarias
- [ ] El `GOOGLE_CLIENT_ID` es el mismo en frontend y backend
- [ ] El `MP_ACCESS_TOKEN` es válido y no expiró
- [ ] MongoDB está conectado correctamente

---

## 🎯 Flujo de Trabajo Recomendado

### Primera vez
1. Copia `.env.example` a `.env`
2. Completa todas las credenciales
3. Ejecuta `npm install`
4. Ejecuta `npm run verify`
5. Si todo está ✓, ejecuta `npm run seed`
6. Inicia el servidor con `npm run dev`

### Cada vez que inicies
1. Ejecuta `npm run dev`
2. Revisa el diagnóstico automático
3. Si hay errores, ejecuta `npm run verify`

### Si algo falla
1. Revisa los logs del servidor
2. Ejecuta `npm run verify`
3. Ejecuta el test específico (`test:google` o `test:mercadopago`)
4. Consulta TROUBLESHOOTING.md

---

## 💡 Tips

- **Logs detallados**: El servidor ahora muestra logs muy detallados. Revísalos siempre.
- **Tests antes de probar**: Ejecuta los tests antes de probar desde la app.
- **Credenciales correctas**: Verifica siempre en los paneles oficiales.
- **Webhooks en desarrollo**: Usa [ngrok](https://ngrok.com/) para exponer tu servidor local.

---

## 🆘 Ayuda

Si después de seguir todos los pasos aún tienes problemas:

1. **Revisa los logs completos** del servidor
2. **Ejecuta** `npm run verify` y copia el resultado
3. **Verifica** las credenciales en los paneles oficiales
4. **Consulta** TROUBLESHOOTING.md para casos específicos

---

**¡Listo para empezar!** 🚀

Ejecuta `npm run verify` y luego `npm run dev`
