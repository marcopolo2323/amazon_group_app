# 🔧 Solución de Problemas - Backend Amazon Group

## ✅ Cambios Realizados

He arreglado varios problemas en el backend relacionados con Google OAuth y MercadoPago:

### 1. **Configuración de Variables de Entorno**
- ✅ Limpiado duplicados de `GOOGLE_CLIENT_ID` en `.env`
- ✅ Asegurado que `GOOGLE_CLIENT_IDS` esté configurado correctamente
- ✅ Verificado que `MP_ACCESS_TOKEN` esté presente

### 2. **Mejoras en el Código**

#### Google OAuth (`src/utils/google.js`)
- ✅ Agregado mejor manejo de errores
- ✅ Mensajes de error más descriptivos

#### Controlador de Usuarios (`src/controllers/users.controller.js`)
- ✅ Validación de que las credenciales de Google estén configuradas
- ✅ Mejor manejo de errores con logs detallados
- ✅ Validación del token antes de procesarlo

#### Servicio de Usuarios (`src/services/users.service.js`)
- ✅ **IMPORTANTE**: Arreglado bug que impedía crear usuarios sin password (necesario para Google OAuth)
- ✅ Ahora los usuarios de Google pueden crearse sin password

#### Controlador de Pagos (`src/controllers/payments.controller.js`)
- ✅ Inicialización mejorada del SDK de MercadoPago
- ✅ Validaciones adicionales antes de crear preferencias
- ✅ Logs detallados en el webhook para debugging
- ✅ Mensajes de error más claros

### 3. **Nuevas Herramientas de Diagnóstico**

He creado varias herramientas para ayudarte a diagnosticar problemas:

#### Scripts de Prueba
```bash
# Probar configuración de Google OAuth
npm run test:google

# Probar configuración de MercadoPago
npm run test:mercadopago

# Probar ambos
npm run test:config
```

#### Diagnóstico Automático
El servidor ahora muestra un diagnóstico completo al iniciar:
```bash
npm run dev
```

Verás algo como:
```
╔════════════════════════════════════════════╗
║   Backend Configuration Diagnostics        ║
╚════════════════════════════════════════════╝

=== Database Configuration ===
✓ MONGODB_URI: mongodb+srv://***:***@...

=== Google OAuth Configuration ===
✓ GOOGLE_CLIENT_ID: 967582207282-q6cefdh...
✓ GOOGLE_CLIENT_IDS: 967582207282-q6cefdh...

=== MercadoPago Configuration ===
✓ MP_ACCESS_TOKEN: APP_USR-3172047395939...
✓ MP_CURRENCY_ID: PEN
```

#### Endpoint de Verificación (Solo Admin)
```bash
# Verificar configuración sin reiniciar el servidor
curl http://localhost:5000/api/config/check \
  -H "Authorization: Bearer tu-token-de-admin"
```

---

## 🚀 Pasos para Probar

### 1. Verificar Configuración

```bash
cd backend
npm run test:config
```

Esto te dirá exactamente qué está mal configurado.

### 2. Iniciar el Servidor

```bash
npm run dev
```

Revisa el diagnóstico que aparece al iniciar. Debe mostrar ✓ en Google OAuth y MercadoPago.

### 3. Probar Google Login

Desde tu aplicación frontend, intenta hacer login con Google. Si falla, revisa los logs del servidor.

**Errores comunes:**
- ❌ "Invalid Google token" → El Client ID del frontend no coincide con el del backend
- ❌ "Google OAuth not configured" → Falta `GOOGLE_CLIENT_ID` en `.env`
- ❌ "Invalid audience" → El token fue generado con un Client ID diferente

### 4. Probar MercadoPago

Intenta crear un pago desde tu aplicación. Si falla, revisa los logs.

**Errores comunes:**
- ❌ "MP_ACCESS_TOKEN no configurado" → Falta en `.env`
- ❌ Error 401 → El token no es válido o expiró
- ❌ "No se pudo crear la preferencia" → Problema con los datos o credenciales

---

## 🔍 Verificación de Credenciales

### Google OAuth

Tu `.env` tiene:
```env
GOOGLE_CLIENT_ID=967582207282-q6cefdhhvugletk9qsu8ov7t60b6n6iu.apps.googleusercontent.com
```

**Verifica:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Busca este Client ID
3. Asegúrate de que los **Orígenes autorizados** incluyan:
   - `http://localhost:8081`
   - `http://localhost:3000`
   - Tu dominio de producción

4. En tu app frontend, usa **exactamente el mismo Client ID**

### MercadoPago

Tu `.env` tiene:
```env
MP_ACCESS_TOKEN=APP_USR-3172047395939344-101611-2f27af5de30b055253b0f7e9fe94bc99-2925914622
```

**Verifica:**
1. Ve a [MercadoPago Developers](https://www.mercadopago.com.pe/developers/panel/credentials)
2. Verifica que este token sea válido
3. Para pruebas, usa el **Access Token de Test**
4. Para producción, usa el **Access Token de Production**

**Ejecuta el test:**
```bash
npm run test:mercadopago
```

Si el test falla con error 401, el token no es válido.

---

## 📋 Checklist de Solución

- [ ] Ejecutar `npm run test:config` sin errores
- [ ] Iniciar servidor con `npm run dev` y ver ✓ en el diagnóstico
- [ ] Verificar Client ID de Google en Cloud Console
- [ ] Verificar que el frontend use el mismo Client ID
- [ ] Verificar Access Token de MercadoPago en el panel
- [ ] Probar login con Google desde la app
- [ ] Probar crear un pago desde la app
- [ ] Revisar logs del servidor si algo falla

---

## 🐛 Si Aún No Funciona

### Google Login

1. **Verifica el token en el frontend:**
   ```javascript
   console.log('Google ID Token:', idToken);
   ```

2. **Verifica la respuesta del backend:**
   ```javascript
   console.log('Backend response:', response);
   ```

3. **Revisa los logs del servidor:**
   Busca líneas que digan "Google login error"

4. **Verifica que el Client ID sea el correcto:**
   - En Google Cloud Console
   - En tu `.env` del backend
   - En tu código del frontend

### MercadoPago

1. **Ejecuta el test:**
   ```bash
   npm run test:mercadopago
   ```

2. **Si falla con 401:**
   - El token expiró o no es válido
   - Genera un nuevo token en MercadoPago Developers

3. **Si falla con 400:**
   - Revisa los datos que estás enviando
   - Asegúrate de que el precio sea > 0

4. **Si el webhook no funciona:**
   - En desarrollo, usa [ngrok](https://ngrok.com/) para exponer tu servidor
   - Configura la URL del webhook en MercadoPago

---

## 📚 Documentación Adicional

- **TROUBLESHOOTING.md**: Guía detallada de solución de problemas
- **test-google-oauth.js**: Script para probar Google OAuth
- **test-mercadopago.js**: Script para probar MercadoPago
- **src/utils/diagnostics.js**: Utilidad de diagnóstico

---

## 💡 Consejos

1. **Siempre revisa los logs del servidor** cuando algo falle
2. **Usa los scripts de prueba** antes de probar desde la app
3. **Verifica las credenciales** en los paneles de Google y MercadoPago
4. **En producción**, cambia `JWT_SECRET` a un valor seguro
5. **Para webhooks**, necesitas un servidor público (usa ngrok en desarrollo)

---

## ✉️ Contacto

Si después de seguir todos estos pasos aún tienes problemas, revisa:
- Los logs completos del servidor
- La configuración en Google Cloud Console
- La configuración en MercadoPago Developers
- Que tu cuenta de MercadoPago esté verificada

¡Buena suerte! 🚀
