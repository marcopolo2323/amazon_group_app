require('dotenv').config();
const mongoose = require('mongoose');

async function testAdminEndpoints() {
  console.log('🔍 Verificando endpoints de admin...\n');

  try {
    // Conectar a MongoDB
    console.log('1. Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('   ✓ MongoDB conectado\n');

    // Importar modelos
    const User = require('./src/models/User');
    const Affiliate = require('./src/models/Affiliate');
    const Service = require('./src/models/Service');
    const Order = require('./src/models/Order');
    const Transaction = require('./src/models/Transaction');

    // Verificar datos
    console.log('2. Verificando datos en la base de datos:');
    const userCount = await User.countDocuments();
    const clientCount = await User.countDocuments({ role: 'client' });
    const affiliateCount = await Affiliate.countDocuments({ status: 'approved' });
    const pendingAffiliates = await Affiliate.countDocuments({ status: 'pending' });
    const serviceCount = await Service.countDocuments();
    const orderCount = await Order.countDocuments();
    const transactionCount = await Transaction.countDocuments();

    console.log(`   Total usuarios: ${userCount}`);
    console.log(`   Clientes: ${clientCount}`);
    console.log(`   Afiliados aprobados: ${affiliateCount}`);
    console.log(`   Afiliados pendientes: ${pendingAffiliates}`);
    console.log(`   Servicios: ${serviceCount}`);
    console.log(`   Órdenes: ${orderCount}`);
    console.log(`   Transacciones: ${transactionCount}\n`);

    // Verificar admin
    console.log('3. Verificando usuario admin:');
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('   ✓ Usuario admin existe');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Nombre: ${admin.name}`);
    } else {
      console.log('   ✗ No existe usuario admin');
      console.log('   Solución: Ejecuta este comando en MongoDB:');
      console.log('   db.users.updateOne({ email: "tu-email@ejemplo.com" }, { $set: { role: "admin" } })');
    }
    console.log('');

    // Calcular estadísticas
    console.log('4. Calculando estadísticas (como el endpoint):');
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyOrders = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });
    
    const totalRevenueResult = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformAmount' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const monthlyRevenueResult = await Transaction.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$platformAmount' } } },
    ]);
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;

    console.log(`   Órdenes este mes: ${monthlyOrders}`);
    console.log(`   Ingresos totales: S/ ${totalRevenue.toFixed(2)}`);
    console.log(`   Ingresos este mes: S/ ${monthlyRevenue.toFixed(2)}\n`);

    // Verificar rutas
    console.log('5. Verificando rutas de admin:');
    console.log('   Las siguientes rutas deberían estar disponibles:');
    console.log('   GET  /api/admin/stats');
    console.log('   GET  /api/admin/users');
    console.log('   GET  /api/admin/affiliates');
    console.log('   PATCH /api/admin/affiliates/:id/status');
    console.log('   GET  /api/admin/services');
    console.log('   GET  /api/admin/orders');
    console.log('   GET  /api/admin/transactions');
    console.log('   GET  /api/admin/pending-payments\n');

    // Recomendaciones
    console.log('6. Recomendaciones:');
    if (userCount === 0) {
      console.log('   ⚠️  Base de datos vacía. Ejecuta: npm run seed');
    }
    if (!admin) {
      console.log('   ⚠️  No hay usuario admin. Crea uno en MongoDB.');
    }
    if (serviceCount === 0) {
      console.log('   ⚠️  No hay servicios. Ejecuta: npm run seed');
    }
    if (userCount > 0 && admin && serviceCount > 0) {
      console.log('   ✅ Todo listo para usar el panel de admin');
    }

    await mongoose.disconnect();
    console.log('\n✅ Diagnóstico completado');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAdminEndpoints();
