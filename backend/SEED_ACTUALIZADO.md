# Seed Actualizado para MongoDB Atlas

## ✅ Cambios Realizados

El archivo `src/seed/seed.js` ha sido completamente actualizado para trabajar correctamente con MongoDB Atlas y todas las colecciones del sistema.

### Nuevas Características

1. **Todas las Colecciones Incluidas**
   - Categories (12 categorías)
   - Users (3 clientes, 4 afiliados, 1 admin)
   - Affiliates (4 perfiles de afiliados)
   - Services (8 servicios)
   - Orders (6 órdenes)
   - Transactions (5 transacciones)
   - Reviews (8 reseñas)
   - Notifications (5 notificaciones)
   - Disputes (1 disputa)
   - AffiliatePayments (2 pagos a afiliados)

2. **Datos Más Realistas**
   - Avatares de usuarios usando pravatar.cc
   - Imágenes de servicios usando Unsplash
   - Fechas dinámicas basadas en la fecha actual
   - Información bancaria completa para afiliados
   - Métodos de pago variados (MercadoPago, Yape, Plin, etc.)

3. **Mejor Manejo de Errores**
   - Validación de conexión a MongoDB
   - Mensajes de error descriptivos
   - Proceso de limpieza seguro

4. **Estadísticas Automáticas**
   - Cálculo automático de ganancias totales por afiliado
   - Promedio de calificaciones
   - Conteo de servicios y reseñas

5. **Salida Mejorada**
   - Emojis para mejor visualización
   - Resumen completo al final
   - Credenciales de prueba claramente mostradas

## 📊 Datos de Prueba

### Usuarios Admin
- **Email:** admin@amazongroup.com
- **Password:** admin123

### Clientes
- **Email:** ana.garcia@example.com | **Password:** 123456
- **Email:** carlos.mendoza@example.com | **Password:** 123456
- **Email:** laura.perez@example.com | **Password:** 123456

### Afiliados
- **Email:** maria.gonzalez@example.com | **Password:** 123456 (Aprobado)
- **Email:** jose.rodriguez@example.com | **Password:** 123456 (Aprobado)
- **Email:** carmen.lopez@example.com | **Password:** 123456 (Aprobado)
- **Email:** roberto.silva@example.com | **Password:** 123456 (Pendiente)

## 🚀 Uso

```bash
# Ejecutar el seed
npm run seed

# O directamente
node src/seed/seed.js
```

## 📝 Estructura de Datos

### Categorías
- Casas, Agua, Taxis, Hoteles, Lugares Turísticos, Restaurantes, Discotecas, Decoración para fiestas, Zapatos, Ropa, Limpieza del hogar, Reparaciones

### Servicios
Cada servicio incluye:
- Título y descripción detallada
- Precio en PEN (Soles Peruanos)
- Imágenes de ejemplo
- Ubicación con coordenadas GPS
- Características y disponibilidad
- Información de contacto

### Órdenes
Las órdenes incluyen diferentes estados:
- **Completadas:** Órdenes pasadas con pago confirmado
- **En Progreso:** Órdenes actuales siendo procesadas
- **Pendientes:** Órdenes futuras esperando confirmación

### Transacciones
- Cálculo automático de comisión (5% plataforma, 95% afiliado)
- IDs de pasarela de pago simulados
- Estado de transacción

### Notificaciones
Diferentes tipos:
- Pedidos nuevos/confirmados/completados
- Pagos recibidos/pendientes
- Aprobación de afiliados
- Nuevas reseñas

### Disputas
Sistema completo de resolución de conflictos:
- Tipos de disputa (calidad, comunicación, pago, fraude)
- Evidencia adjunta
- Mensajes entre partes
- Resolución por admin

### Pagos a Afiliados
- Métodos: Transferencia bancaria, Yape, Plin
- Estados: Completado, Pendiente
- Comprobantes y referencias
- Fechas programadas

## 🔧 Configuración

Asegúrate de tener configurado correctamente tu `.env`:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/?appName=amazon
```

## ✨ Mejoras Implementadas

1. ✅ Limpieza completa de todas las colecciones antes de insertar
2. ✅ Validación de conexión a MongoDB Atlas
3. ✅ Datos relacionados correctamente entre colecciones
4. ✅ Estadísticas calculadas automáticamente
5. ✅ Fechas dinámicas para datos realistas
6. ✅ Múltiples estados de órdenes y transacciones
7. ✅ Sistema completo de notificaciones
8. ✅ Disputas con resolución
9. ✅ Pagos a afiliados con diferentes métodos
10. ✅ Salida formateada y fácil de leer

## 🎯 Próximos Pasos

El seed está listo para usar. Puedes:
1. Ejecutar `npm run seed` para poblar la base de datos
2. Iniciar el servidor con `npm run dev`
3. Probar la API con los usuarios de prueba
4. Verificar que todas las colecciones tienen datos

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que MongoDB Atlas esté accesible
2. Revisa que el MONGODB_URI sea correcto
3. Asegúrate de tener las dependencias instaladas (`npm install`)
