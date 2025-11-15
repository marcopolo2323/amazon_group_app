# Guía de Solución de Problemas - Backend

## 🔍 Diagnóstico Rápido

Ejecuta estos comandos para verificar tu configuración:

```bash
# Verificar MercadoPago
node test-mercadopago.js

# Verificar Google OAuth
node test-google-oauth.js

# Iniciar servidor (mostrará diagnóstico automático)
npm run dev
```

---

## 🔐 Problema: Login con Google no funciona

### Síntomas
- Error "Invalid Google token"
- Error "Google OAuth not configured"
- El botón de Google no responde

### Soluciones

#### 1. Verificar Client ID en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs y servicios > Credenciales**
4. Encuentra tu **ID de cliente de OAuth 2.0**
5. Verifica que el Client ID en tu `.env` coincida exactamente

#### 2. Configurar Orígenes Autorizados

En Google Cloud Console, en tu Client ID de OAuth 2.0:

**Orígenes de JavaScript autorizados:**
```
http://localhost:8081
http://localhost:3000
http://localhost:19006
http://192.168.56.1:8081
```

**URIs de redirección autorizados:**
```
http://localhost:8081
http://localhost:3000
```

#### 3. Verificar configuración en .env

Tu archivo `.env` debe tener:
```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_IDS=tu-client-id.apps.googleusercontent.com
```

#### 4. Verificar en el Frontend

Asegúrate de que tu aplicación React Native/Expo esté usando el **mismo Client ID**:

```javascript
// En tu configuración de Google Sign-In
const webClientId = '967582207282-q6cefdhhvugletk9qsu8ov7t60b6n6iu.apps.googleusercontent.com';
```

#### 5. Tipos de Client ID

Google genera diferentes Client IDs para diferentes plataformas:
- **Web Client ID**: Para aplicaciones web y Expo
- **Android Client ID**: Para apps Android nativas
- **iOS Client ID**: Para apps iOS nativas

Para Expo/React Native, generalmente necesitas el **Web Client ID**.

### Errores Comunes

**Error: "Invalid audience"**
- El Client ID en el backend no coincide con el del frontend
- Solución: Verifica que ambos usen el mismo Client ID

**Error: "Token used too late"**
- El token de Google expiró
- Solución: Los tokens de Google expiran rápido, asegúrate de enviarlos inmediatamente

---

## 💳 Problema: Pagos con MercadoPago no funcionan

### Síntomas
- Error "MP_ACCESS_TOKEN no configurado"
- Error al crear preferencia
- Error 401 Unauthorized
- No se genera el link de pago

### Soluciones

#### 1. Obtener Access Token de MercadoPago

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.pe/developers/panel/credentials)
2. Inicia sesión con tu cuenta de MercadoPago
3. Ve a **Credenciales**
4. Copia el **Access Token** (Production o Test)

**IMPORTANTE:** 
- Para pruebas, usa el **Access Token de Test**
- Para producción, usa el **Access Token de Production**
- El token debe empezar con `APP_USR-`

#### 2. Configurar en .env

```env
MP_ACCESS_TOKEN=APP_USR-3172047395939344-101611-2f27af5de30b055253b0f7e9fe94bc99-2925914622
MP_CURRENCY_ID=PEN
```

#### 3. Verificar que el token sea válido

Ejecuta el script de prueba:
```bash
node test-mercadopago.js
```

Si ves un error 401, el token no es válido o ha expirado.

#### 4. Verificar cuenta de MercadoPago

- Tu cuenta debe estar **verificada**
- Debes tener **permisos de vendedor**
- La cuenta debe estar activa

#### 5. Webhook Configuration

Para recibir notificaciones de pago, MercadoPago necesita acceder a tu servidor:

**En desarrollo:**
- Usa [ngrok](https://ngrok.com/) para exponer tu servidor local
- Configura la URL del webhook en MercadoPago

**En producción:**
- Asegúrate de que tu servidor sea accesible públicamente
- El webhook está en: `https://tu-dominio.com/api/payments/mercadopago/webhook`

### Errores Comunes

**Error 401: Unauthorized**
- El Access Token no es válido
- Solución: Genera un nuevo token en el panel de MercadoPago

**Error 400: Bad Request**
- Los datos de la preferencia son inválidos
- Solución: Verifica que el precio sea mayor a 0 y la moneda sea válida

**Error: "No se pudo crear la preferencia"**
- Problema de red o configuración
- Solución: Verifica tu conexión y las credenciales

---

## 🔧 Verificación General

### Checklist de Configuración

- [ ] MongoDB conectado correctamente
- [ ] JWT_SECRET configurado (no usar "change_me")
- [ ] GOOGLE_CLIENT_ID configurado
- [ ] MP_ACCESS_TOKEN configurado
- [ ] SMTP configurado (opcional, para emails)
- [ ] CORS configurado para tu frontend
- [ ] Puerto 5000 disponible

### Logs Útiles

El servidor ahora muestra un diagnóstico al iniciar. Busca:

```
=== Backend Configuration Diagnostics ===
✓ Database: Connected
✓ Google OAuth: Configured
✓ MercadoPago: Configured
```

### Comandos de Depuración

```bash
# Ver logs del servidor
npm run dev

# Probar endpoint de salud
curl http://localhost:5000/health

# Probar login con Google (necesitas un token real)
curl -X POST http://localhost:5000/api/users/oauth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"tu-token-de-google"}'

# Probar creación de preferencia de MercadoPago (necesitas estar autenticado)
curl -X POST http://localhost:5000/api/payments/mercadopago/preference \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-jwt-token" \
  -d '{"serviceId":"id-del-servicio"}'
```

---

## 📞 Soporte Adicional

Si los problemas persisten:

1. Revisa los logs del servidor en la consola
2. Verifica que todas las dependencias estén instaladas: `npm install`
3. Asegúrate de estar usando Node.js 18 o superior: `node --version`
4. Verifica que MongoDB esté corriendo
5. Revisa que no haya conflictos de puerto

### Recursos Útiles

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [MercadoPago API Documentation](https://www.mercadopago.com.pe/developers/es/docs)
- [Expo Google Sign-In](https://docs.expo.dev/guides/google-authentication/)

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. Cambia `JWT_SECRET` a un valor seguro en producción
2. Usa Access Token de **Production** de MercadoPago
3. Configura un dominio real para los webhooks
4. Habilita HTTPS en producción
5. Configura rate limiting apropiado
6. Implementa logging robusto
