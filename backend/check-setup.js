/* Script de verificación rápida del setup
   
   Este script verifica que todo esté configurado correctamente antes de iniciar.
   
   Uso: node check-setup.js
*/

const path = require("path");
const fs = require("fs");

console.log("\n🔍 Verificando configuración del backend...\n");

let hasErrors = false;

// 1. Verificar que existe .env
console.log("1️⃣  Verificando archivo .env...");
if (fs.existsSync(path.join(__dirname, ".env"))) {
  console.log("   ✅ Archivo .env encontrado\n");
} else {
  console.log("   ❌ Archivo .env NO encontrado");
  console.log("   💡 Copia .env.example a .env y configura tus variables\n");
  hasErrors = true;
}

// 2. Cargar variables de entorno
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// 3. Verificar variables críticas
console.log("2️⃣  Verificando variables de entorno críticas...");
const requiredVars = {
  MONGODB_URI: "URI de conexión a MongoDB",
  JWT_SECRET: "Secreto para JWT",
  PORT: "Puerto del servidor",
};

let missingVars = [];
for (const [varName, description] of Object.entries(requiredVars)) {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: ${description}`);
  } else {
    console.log(`   ❌ ${varName}: ${description} - NO CONFIGURADO`);
    missingVars.push(varName);
    hasErrors = true;
  }
}
console.log();

// 4. Verificar conexión a MongoDB
console.log("3️⃣  Verificando conexión a MongoDB...");
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    console.log("   ✅ Conexión exitosa a MongoDB");
    console.log(`   📊 Base de datos: ${mongoose.connection.name}`);
    console.log(`   🌐 Host: ${mongoose.connection.host}\n`);

    // 5. Verificar colecciones
    console.log("4️⃣  Verificando colecciones...");
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    if (collections.length === 0) {
      console.log("   ⚠️  No hay colecciones en la base de datos");
      console.log("   💡 Ejecuta 'npm run seed' para poblar la base de datos\n");
    } else {
      console.log(`   ✅ ${collections.length} colecciones encontradas:`);
      collections.forEach((c) => console.log(`      - ${c.name}`));
      console.log();

      // 6. Verificar datos
      console.log("5️⃣  Verificando datos...");
      const User = require("./src/models/User");
      const Service = require("./src/models/Service");
      const Category = require("./src/models/Category");

      const userCount = await User.countDocuments();
      const serviceCount = await Service.countDocuments();
      const categoryCount = await Category.countDocuments();

      if (userCount === 0 || serviceCount === 0 || categoryCount === 0) {
        console.log("   ⚠️  Algunas colecciones están vacías:");
        console.log(`      - Usuarios: ${userCount}`);
        console.log(`      - Servicios: ${serviceCount}`);
        console.log(`      - Categorías: ${categoryCount}`);
        console.log("   💡 Ejecuta 'npm run seed' para poblar la base de datos\n");
      } else {
        console.log("   ✅ Datos encontrados:");
        console.log(`      - Usuarios: ${userCount}`);
        console.log(`      - Servicios: ${serviceCount}`);
        console.log(`      - Categorías: ${categoryCount}\n`);
      }
    }

    // 7. Verificar dependencias opcionales
    console.log("6️⃣  Verificando configuraciones opcionales...");
    const optionalVars = {
      CLOUDINARY_CLOUD_NAME: "Cloudinary (para imágenes)",
      MP_ACCESS_TOKEN: "MercadoPago (para pagos)",
      GOOGLE_CLIENT_ID: "Google OAuth (para login)",
      SMTP_USER: "Email (para notificaciones)",
    };

    let configuredOptional = 0;
    for (const [varName, description] of Object.entries(optionalVars)) {
      if (process.env[varName] && process.env[varName] !== "your_" + varName.toLowerCase()) {
        console.log(`   ✅ ${description}`);
        configuredOptional++;
      } else {
        console.log(`   ⚠️  ${description} - No configurado`);
      }
    }
    console.log();

    // Resumen final
    console.log("═".repeat(70));
    if (hasErrors) {
      console.log("❌ CONFIGURACIÓN INCOMPLETA");
      console.log("═".repeat(70));
      console.log("\n💡 Acciones requeridas:");
      if (missingVars.length > 0) {
        console.log(`   - Configura las variables: ${missingVars.join(", ")}`);
      }
      console.log("   - Revisa el archivo .env");
      console.log("   - Consulta .env.example para referencia\n");
      process.exit(1);
    } else {
      console.log("✅ CONFIGURACIÓN COMPLETA");
      console.log("═".repeat(70));
      console.log("\n🎉 Todo está listo para iniciar el servidor!");
      console.log("\n📋 Comandos disponibles:");
      console.log("   - npm run dev        → Iniciar servidor de desarrollo");
      console.log("   - npm run seed       → Poblar base de datos");
      console.log("   - npm run verify:db  → Ver estadísticas de la BD");
      console.log();
      
      if (configuredOptional < Object.keys(optionalVars).length) {
        console.log("💡 Configuraciones opcionales pendientes:");
        for (const [varName, description] of Object.entries(optionalVars)) {
          if (!process.env[varName] || process.env[varName] === "your_" + varName.toLowerCase()) {
            console.log(`   - ${description}`);
          }
        }
        console.log();
      }
      
      process.exit(0);
    }
  })
  .catch((err) => {
    console.log("   ❌ Error de conexión a MongoDB");
    console.log(`   📝 Mensaje: ${err.message}\n`);
    console.log("═".repeat(70));
    console.log("❌ ERROR DE CONEXIÓN");
    console.log("═".repeat(70));
    console.log("\n💡 Posibles soluciones:");
    console.log("   1. Verifica que MONGODB_URI sea correcto en .env");
    console.log("   2. Asegúrate de que MongoDB Atlas esté accesible");
    console.log("   3. Verifica tu conexión a internet");
    console.log("   4. Revisa que tu IP esté en la whitelist de MongoDB Atlas\n");
    process.exit(1);
  });
