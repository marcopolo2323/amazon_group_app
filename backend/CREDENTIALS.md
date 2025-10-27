# Amazon Group App - Credenciales de Prueba

Este documento contiene las credenciales para probar la aplicación Amazon Group en diferentes roles.

## 🔐 Credenciales de Login

### Cliente
- **Email:** `ana.garcia@example.com`
- **Contraseña:** `123456`
- **Rol:** Cliente
- **Descripción:** Cuenta de cliente para probar funcionalidades de reservas y pedidos

### Afiliado 
- **Email:** `maria.gonzalez@example.com` 
- **Contraseña:** `123456`
- **Rol:** Afiliado
- **Descripción:** Cuenta de afiliado para probar dashboard, creación de servicios y gestión

### Administrador
- **Email:** `admin@amazongroup.com`
- **Contraseña:** `admin123` 
- **Rol:** Admin
- **Descripción:** Cuenta administrativa con acceso completo al sistema

## 👥 Otros Usuarios de Prueba

### Clientes Adicionales
- **Email:** `carlos.mendoza@example.com` | **Contraseña:** `123456`

### Afiliados Adicionales  
- **Email:** `jose.rodriguez@example.com` | **Contraseña:** `123456`
- **Email:** `carmen.lopez@example.com` | **Contraseña:** `123456`

## 🏠 Servicios de Ejemplo

La base de datos incluye servicios variados:
- **Casas:** Alquiler de casa en Centro Histórico 
- **Taxis:** Servicio 24/7
- **Restaurantes:** Catering para eventos
- **Agua:** Distribución de bidones
- **Hoteles:** Hotel boutique
- **Turismo:** Tours gastronómicos

## 🔄 Restablecer Datos

Para restablecer los datos de prueba, ejecuta:
```bash
cd backend
node src/seed/seed.js
```

## 📱 Flujo de Prueba Recomendado

### Como Cliente:
1. Login con `ana.garcia@example.com`
2. Explorar servicios desde Inicio
3. Filtrar por categorías
4. Ver detalle de servicio
5. Hacer una reserva
6. Revisar pedidos en la tab "Pedidos"

### Como Afiliado:
1. Login con `maria.gonzalez@example.com`
2. Acceder al dashboard de afiliado
3. Crear nuevo servicio
4. Gestionar servicios existentes
5. Ver ganancias

### Como Admin:
1. Login con `admin@amazongroup.com`
2. Acceder al panel administrativo
3. Gestionar usuarios y servicios

## 🚀 Configuración del Backend

Asegúrate de que el backend esté ejecutándose:
```bash
cd backend
npm start
```

El servidor debe estar disponible en `http://localhost:3000`

## 📝 Notas

- Todos los servicios y pedidos son datos de prueba
- Los pagos son simulados (no reales)
- Las imágenes son placeholders
- Los datos se reinician con cada seeding
- MercadoPago está implementado como mock (para testing)

## 💳 Métodos de Pago Disponibles

### Efectivo
- Pago al recibir el servicio
- No requiere procesamiento previo

### Tarjeta de Crédito/Débito
- Simulación de pago con tarjeta
- Genera ID de transacción mock

### MercadoPago
- Integración simulada con MercadoPago
- Abre enlace mock para testing
- Compatible con todos los métodos de MP (Yape, Plin, tarjetas, etc.)

### Transferencia Bancaria
- Opción para pagos por transferencia
- Requiere confirmación manual

---

**Última actualización:** Diciembre 2024