/* Script para verificar el estado de la base de datos MongoDB Atlas
   
   Este script se conecta a MongoDB y muestra estadísticas de todas las colecciones.
   
   Uso: node verify-database.js
*/

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const mongoose = require("mongoose");

const Category = require("./src/models/Category");
const User = require("./src/models/User");
const Affiliate = require("./src/models/Affiliate");
const Service = require("./src/models/Service");
const Order = require("./src/models/Order");
const Transaction = require("./src/models/Transaction");
const Review = require("./src/models/Review");
const Notification = require("./src/models/Notification");
const Dispute = require("./src/models/Dispute");
const AffiliatePayment = require("./src/models/AffiliatePayment");

async function verifyDatabase() {
  try {
    console.log("🔌 Conectando a MongoDB Atlas...\n");
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log("✅ Conexión exitosa!");
    console.log(`📊 Base de datos: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}\n`);

    console.log("=" .repeat(60));
    console.log("📋 ESTADÍSTICAS DE COLECCIONES");
    console.log("=" .repeat(60) + "\n");

    // Verificar cada colección
    const stats = {
      categories: await Category.countDocuments(),
      users: await User.countDocuments(),
      affiliates: await Affiliate.countDocuments(),
      services: await Service.countDocuments(),
      orders: await Order.countDocuments(),
      transactions: await Transaction.countDocuments(),
      reviews: await Review.countDocuments(),
      notifications: await Notification.countDocuments(),
      disputes: await Dispute.countDocuments(),
      affiliatePayments: await AffiliatePayment.countDocuments(),
    };

    // Mostrar estadísticas
    console.log(`📁 Categorías:           ${stats.categories}`);
    console.log(`👥 Usuarios:             ${stats.users}`);
    console.log(`🏢 Afiliados:            ${stats.affiliates}`);
    console.log(`🛍️  Servicios:            ${stats.services}`);
    console.log(`📦 Órdenes:              ${stats.orders}`);
    console.log(`💳 Transacciones:        ${stats.transactions}`);
    console.log(`⭐ Reseñas:              ${stats.reviews}`);
    console.log(`🔔 Notificaciones:       ${stats.notifications}`);
    console.log(`⚠️  Disputas:             ${stats.disputes}`);
    console.log(`💰 Pagos a Afiliados:    ${stats.affiliatePayments}`);

    console.log("\n" + "=" .repeat(60));
    console.log("👥 DESGLOSE DE USUARIOS");
    console.log("=" .repeat(60) + "\n");

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    usersByRole.forEach(role => {
      const emoji = role._id === "admin" ? "👑" : 
                    role._id === "affiliate" ? "🏢" : "👤";
      console.log(`${emoji} ${role._id.padEnd(10)}: ${role.count}`);
    });

    console.log("\n" + "=" .repeat(60));
    console.log("🏢 ESTADO DE AFILIADOS");
    console.log("=" .repeat(60) + "\n");

    const affiliatesByStatus = await Affiliate.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    affiliatesByStatus.forEach(status => {
      const emoji = status._id === "approved" ? "✅" : 
                    status._id === "pending" ? "⏳" : 
                    status._id === "rejected" ? "❌" : "⏸️";
      console.log(`${emoji} ${status._id.padEnd(10)}: ${status.count}`);
    });

    console.log("\n" + "=" .repeat(60));
    console.log("📦 ESTADO DE ÓRDENES");
    console.log("=" .repeat(60) + "\n");

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    ordersByStatus.forEach(status => {
      const emoji = status._id === "completed" ? "✅" : 
                    status._id === "confirmed" ? "🔵" : 
                    status._id === "in_progress" ? "🔄" :
                    status._id === "pending" ? "⏳" : "❌";
      console.log(`${emoji} ${status._id.padEnd(15)}: ${status.count}`);
    });

    console.log("\n" + "=" .repeat(60));
    console.log("💰 ESTADÍSTICAS FINANCIERAS");
    console.log("=" .repeat(60) + "\n");

    const financialStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAffiliateAmount: { $sum: "$affiliateAmount" },
          totalPlatformAmount: { $sum: "$platformAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    if (financialStats.length > 0) {
      const stats = financialStats[0];
      const total = stats.totalAffiliateAmount + stats.totalPlatformAmount;
      console.log(`💵 Total Transacciones:  S/ ${total.toFixed(2)}`);
      console.log(`👥 Para Afiliados:       S/ ${stats.totalAffiliateAmount.toFixed(2)} (95%)`);
      console.log(`🏢 Para Plataforma:      S/ ${stats.totalPlatformAmount.toFixed(2)} (5%)`);
      console.log(`📊 Número de Trans.:     ${stats.count}`);
    } else {
      console.log("⚠️  No hay transacciones registradas");
    }

    console.log("\n" + "=" .repeat(60));
    console.log("⭐ SERVICIOS MÁS VALORADOS");
    console.log("=" .repeat(60) + "\n");

    const topServices = await Review.aggregate([
      {
        $group: {
          _id: "$serviceId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service"
        }
      },
      { $unwind: "$service" }
    ]);

    if (topServices.length > 0) {
      topServices.forEach((item, index) => {
        const stars = "⭐".repeat(Math.round(item.avgRating));
        console.log(`${index + 1}. ${item.service.title}`);
        console.log(`   ${stars} ${item.avgRating.toFixed(1)} (${item.count} reseñas)`);
        console.log();
      });
    } else {
      console.log("⚠️  No hay reseñas registradas");
    }

    console.log("=" .repeat(60));
    console.log("✅ VERIFICACIÓN COMPLETADA");
    console.log("=" .repeat(60) + "\n");

    const totalDocuments = Object.values(stats).reduce((a, b) => a + b, 0);
    console.log(`📊 Total de documentos en la base de datos: ${totalDocuments}`);
    console.log(`🕐 Fecha de verificación: ${new Date().toLocaleString('es-PE')}\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error durante la verificación:");
    console.error(error.message);
    console.error("\n💡 Sugerencias:");
    console.error("   1. Verifica que MONGODB_URI esté correctamente configurado en .env");
    console.error("   2. Asegúrate de que MongoDB Atlas esté accesible");
    console.error("   3. Verifica tu conexión a internet");
    console.error("   4. Ejecuta 'npm run seed' para poblar la base de datos\n");
    process.exit(1);
  }
}

verifyDatabase();
