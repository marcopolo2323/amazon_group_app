/* Enhanced seeder for the backend
   This script connects to MongoDB Atlas using the existing connectMongo helper,
   and inserts example documents for all collections.

   Collections seeded:
   - Categories
   - Users (clients, affiliates, admin)
   - Affiliates (profiles)
   - Services
   - Orders
   - Transactions
   - Reviews
   - Notifications
   - Disputes
   - AffiliatePayments

   Usage: npm run seed
*/

// load environment variables from .env
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const connectMongo = require("../config/mongo");
const { hashPassword } = require("../utils/auth");

const Category = require("../models/Category");
const User = require("../models/User");
const Affiliate = require("../models/Affiliate");
const Service = require("../models/Service");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Review = require("../models/Review");
const Notification = require("../models/Notification");
const Dispute = require("../models/Dispute");
const AffiliatePayment = require("../models/AffiliatePayment");

async function up() {
  try {
    await connectMongo();
    console.log("✓ Connected to MongoDB Atlas");

    console.log("\n🗑️  Clearing all collections...");
    await Promise.all([
      Category.deleteMany({}),
      User.deleteMany({}),
      Affiliate.deleteMany({}),
      Service.deleteMany({}),
      Order.deleteMany({}),
      Transaction.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      Dispute.deleteMany({}),
      AffiliatePayment.deleteMany({}),
    ]);
    console.log("✓ Collections cleared");
  } catch (err) {
    console.error("❌ Error during initialization:", err.message);
    process.exit(1);
  }

  // Create categories that match frontend service types
  console.log("\n📁 Creating categories...");
  const categoriesData = [
    { name: "Casas", icon: "home-outline", order: 1 },
    { name: "Agua", icon: "water-outline", order: 2 },
    { name: "Taxis", icon: "car-outline", order: 3 },
    { name: "Hoteles", icon: "bed-outline", order: 4 },
    { name: "Lugares Turísticos", icon: "location-outline", order: 5 },
    { name: "Restaurantes", icon: "restaurant-outline", order: 6 },
    { name: "Discotecas", icon: "musical-notes-outline", order: 7 },
    { name: "Decoración para fiestas", icon: "gift-outline", order: 8 },
    { name: "Zapatos", icon: "footsteps-outline", order: 9 },
    { name: "Ropa", icon: "shirt-outline", order: 10 },
    { name: "Limpieza del hogar", icon: "home-outline", order: 11 },
    { name: "Reparaciones", icon: "build-outline", order: 12 },
  ];

  const categories = await Category.insertMany(categoriesData);
  console.log(`✓ Created ${categories.length} categories`);

  // Create users: clients, affiliates and admin
  console.log("\n👥 Creating users...");
  const clientPassword = await hashPassword("123456");
  const affiliatePassword = await hashPassword("123456");
  const adminPassword = await hashPassword("admin123");

  const clients = await User.insertMany([
    {
      role: "client",
      name: "Ana García",
      email: "ana.garcia@example.com",
      phone: "+51987123456",
      password: clientPassword,
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      role: "client",
      name: "Carlos Mendoza",
      email: "carlos.mendoza@example.com",
      phone: "+51987654321",
      password: clientPassword,
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      role: "client",
      name: "Laura Pérez",
      email: "laura.perez@example.com",
      phone: "+51987789012",
      password: clientPassword,
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  ]);

  const affiliateUsers = await User.insertMany([
    {
      role: "affiliate",
      name: "María González",
      email: "maria.gonzalez@example.com",
      phone: "+51987111222",
      password: affiliatePassword,
      avatar: "https://i.pravatar.cc/150?img=10",
      bio: "Especialista en alquiler de propiedades con 5 años de experiencia",
    },
    {
      role: "affiliate",
      name: "José Rodríguez",
      email: "jose.rodriguez@example.com",
      phone: "+51987333444",
      password: affiliatePassword,
      avatar: "https://i.pravatar.cc/150?img=11",
      bio: "Conductor profesional con vehículo propio, disponible 24/7",
    },
    {
      role: "affiliate",
      name: "Carmen López",
      email: "carmen.lopez@example.com",
      phone: "+51987555666",
      password: affiliatePassword,
      avatar: "https://i.pravatar.cc/150?img=12",
      bio: "Chef profesional con experiencia en eventos y catering",
    },
    {
      role: "affiliate",
      name: "Roberto Silva",
      email: "roberto.silva@example.com",
      phone: "+51987777888",
      password: affiliatePassword,
      avatar: "https://i.pravatar.cc/150?img=13",
      bio: "Técnico especializado en reparaciones del hogar",
    },
  ]);

  const admin = await User.create({
    role: "admin",
    name: "Admin System",
    email: "admin@amazongroup.com",
    phone: "+51900000000",
    password: adminPassword,
    avatar: "https://i.pravatar.cc/150?img=50",
  });

  console.log(
    `✓ Created ${clients.length} clients, ${affiliateUsers.length} affiliates, 1 admin`,
  );

  // Create affiliate profiles
  console.log("\n🏢 Creating affiliate profiles...");
  const affiliateProfiles = await Promise.all(
    affiliateUsers.map(async (user, index) => {
      const statuses = ["approved", "approved", "approved", "pending"];
      return await Affiliate.create({
        affiliateId: user._id,
        dni: `${12345678 + index}`,
        dniDocument: `https://example.com/dni/${user._id}.jpg`,
        status: statuses[index],
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        documentsComplete: statuses[index] === "approved",
        bankAccount: {
          bank: "BCP",
          number: `19100${1000000 + index}`,
          accountType: "savings",
        },
        yapePhone: user.phone,
        plinPhone: user.phone,
        experience: `${3 + index} años`,
        specialties: index === 0 ? ["Casas", "Hoteles"] : 
                     index === 1 ? ["Taxis", "Transporte"] :
                     index === 2 ? ["Restaurantes", "Catering"] :
                     ["Reparaciones", "Limpieza"],
        description: user.bio,
        totalEarnings: 0,
        totalServices: 0,
        rating: 0,
        reviewCount: 0,
        reviewedBy: statuses[index] === "approved" ? admin._id : null,
        reviewedAt: statuses[index] === "approved" ? new Date() : null,
      });
    }),
  );

  console.log(`✓ Created ${affiliateProfiles.length} affiliate profiles`);

  // Create services by different affiliates (only approved affiliates)
  console.log("\n🛍️  Creating services...");
  const approvedAffiliates = affiliateUsers.filter((_, index) => index < 3);
  
  const servicesData = [
    {
      affiliateId: approvedAffiliates[0]._id,
      category: "Casas",
      title: "Casa en Alquiler - Centro Histórico",
      description:
        "Hermosa casa colonial de 3 habitaciones, 2 baños, completamente amueblada en el corazón del centro histórico de Lima. Cuenta con cocina equipada, sala-comedor espaciosa, patio interior y excelente ubicación cerca de museos, restaurantes y transporte público.",
      price: 800,
      currency: "PEN",
      images: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      ],
      location: {
        lat: -12.0464,
        lng: -77.0428,
        address: "Jr. Ucayali 234, Centro Histórico, Lima",
        city: "Lima",
      },
      status: "active",
      features: [
        "3 habitaciones",
        "2 baños",
        "Amueblado",
        "Cocina equipada",
        "Patio",
        "Internet incluido",
      ],
      availability: {
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
        startTime: "09:00",
        endTime: "18:00",
      },
      contactPhone: approvedAffiliates[0].phone,
      contactEmail: approvedAffiliates[0].email,
    },
    {
      affiliateId: approvedAffiliates[1]._id,
      category: "Taxis",
      title: "Taxi Seguro 24/7",
      description:
        "Servicio de taxi confiable y seguro disponible las 24 horas del día. Vehículo en excelente estado, conductor con experiencia de más de 5 años. Ideal para traslados al aeropuerto, citas médicas, reuniones de trabajo o cualquier destino en Lima y alrededores.",
      price: 25,
      currency: "PEN",
      images: [
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
      ],
      location: { 
        lat: -12.1, 
        lng: -77.05, 
        address: "Toda Lima Metropolitana",
        city: "Lima",
      },
      status: "active",
      features: [
        "Disponible 24/7",
        "Vehículo climatizado",
        "Conductor experimentado",
        "GPS actualizado",
        "Seguro completo",
      ],
      availability: {
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        startTime: "00:00",
        endTime: "23:59",
      },
      contactPhone: approvedAffiliates[1].phone,
      contactEmail: approvedAffiliates[1].email,
    },
    {
      affiliateId: approvedAffiliates[2]._id,
      category: "Restaurantes",
      title: "Catering El Buen Sabor",
      description:
        "Servicio de catering profesional para eventos, reuniones corporativas, celebraciones familiares y ocasiones especiales. Ofrecemos comida peruana tradicional e internacional preparada con ingredientes frescos y de primera calidad.",
      price: 35,
      currency: "PEN",
      images: [
        "https://images.unsplash.com/photo-1555244162-803834f70033?w=800",
      ],
      location: { 
        lat: -12.08, 
        lng: -77.03, 
        address: "San Borja, Lima",
        city: "Lima",
      },
      status: "active",
      features: [
        "Comida peruana e internacional",
        "Ingredientes frescos",
        "Servicio personalizado",
        "Montaje incluido",
        "Vajilla disponible",
      ],
      availability: {
        days: [
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        startTime: "08:00",
        endTime: "20:00",
      },
      contactPhone: approvedAffiliates[2].phone,
      contactEmail: approvedAffiliates[2].email,
    },
    {
      affiliateId: approvedAffiliates[0]._id,
      category: "Agua",
      title: "Distribución de Agua Purificada",
      description:
        "Servicio de entrega de agua purificada a domicilio. Bidones de 20 litros con agua tratada con los más altos estándares de calidad. Entrega puntual y servicio confiable para hogares y oficinas.",
      price: 15,
      currency: "PEN",
      images: [
        "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800",
      ],
      location: { 
        lat: -12.06, 
        lng: -77.04, 
        address: "Lima Metropolitana",
        city: "Lima",
      },
      status: "active",
      features: [
        "Agua purificada",
        "Bidones de 20L",
        "Entrega a domicilio",
        "Horarios flexibles",
        "Calidad garantizada",
      ],
      availability: {
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
        startTime: "08:00",
        endTime: "18:00",
      },
      contactPhone: approvedAffiliates[0].phone,
      contactEmail: approvedAffiliates[0].email,
    },
    {
      affiliateId: approvedAffiliates[1]._id,
      category: "Hoteles",
      title: "Hotel Boutique Plaza",
      description:
        "Hotel boutique en el centro de Lima con habitaciones elegantes y modernas. Perfecto para viajeros de negocios y turistas que buscan comodidad y ubicación estratégica. Incluye desayuno buffet y WiFi gratuito.",
      price: 120,
      currency: "PEN",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      ],
      location: {
        lat: -12.045,
        lng: -77.035,
        address: "Plaza Mayor, Centro de Lima",
        city: "Lima",
      },
      status: "active",
      features: [
        "Habitaciones modernas",
        "Desayuno incluido",
        "WiFi gratis",
        "Ubicación céntrica",
        "Atención 24/7",
      ],
      availability: {
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        startTime: "00:00",
        endTime: "23:59",
      },
      contactPhone: approvedAffiliates[1].phone,
      contactEmail: approvedAffiliates[1].email,
    },
    {
      affiliateId: approvedAffiliates[2]._id,
      category: "Lugares Turísticos",
      title: "Tour Gastronómico Lima",
      description:
        "Recorrido gastronómico por los mejores restaurantes y mercados de Lima. Conoce la rica tradición culinaria peruana de la mano de guías expertos. Incluye degustaciones, visitas a mercados tradicionales y restaurantes reconocidos.",
      price: 80,
      currency: "PEN",
      images: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      ],
      location: {
        lat: -12.05,
        lng: -77.045,
        address: "Centro de Lima y Miraflores",
        city: "Lima",
      },
      status: "active",
      features: [
        "Guía especializado",
        "Degustaciones incluidas",
        "Transporte incluido",
        "6 horas de duración",
        "Grupos pequeños",
      ],
      availability: {
        days: [
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        startTime: "09:00",
        endTime: "15:00",
      },
      contactPhone: approvedAffiliates[2].phone,
      contactEmail: approvedAffiliates[2].email,
    },
    {
      affiliateId: approvedAffiliates[0]._id,
      category: "Hoteles",
      title: "Departamento Amoblado - Miraflores",
      description:
        "Moderno departamento completamente amoblado en el corazón de Miraflores. 2 habitaciones, 1 baño, cocina equipada, sala-comedor. Excelente ubicación cerca de parques, restaurantes y centros comerciales.",
      price: 1200,
      currency: "PEN",
      images: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      ],
      location: {
        lat: -12.1198,
        lng: -77.0350,
        address: "Av. Larco 890, Miraflores, Lima",
        city: "Lima",
      },
      status: "active",
      features: [
        "2 habitaciones",
        "1 baño",
        "Completamente amoblado",
        "Cocina equipada",
        "Seguridad 24/7",
        "Estacionamiento",
      ],
      availability: {
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
        startTime: "09:00",
        endTime: "18:00",
      },
      contactPhone: approvedAffiliates[0].phone,
      contactEmail: approvedAffiliates[0].email,
    },
    {
      affiliateId: approvedAffiliates[2]._id,
      category: "Reparaciones",
      title: "Reparaciones del Hogar",
      description:
        "Servicio profesional de reparaciones para el hogar. Electricidad, gasfitería, pintura, carpintería y más. Técnicos calificados con experiencia. Presupuesto sin compromiso.",
      price: 50,
      currency: "PEN",
      images: [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
      ],
      location: {
        lat: -12.08,
        lng: -77.03,
        address: "Lima Metropolitana",
        city: "Lima",
      },
      status: "active",
      features: [
        "Técnicos calificados",
        "Presupuesto gratuito",
        "Garantía de trabajo",
        "Atención rápida",
        "Materiales de calidad",
      ],
      availability: {
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
        startTime: "08:00",
        endTime: "18:00",
      },
      contactPhone: approvedAffiliates[2].phone,
      contactEmail: approvedAffiliates[2].email,
    },
  ];

  const services = await Service.insertMany(servicesData);
  console.log(`✓ Created ${services.length} services`);

  // Create sample reviews to provide ratings for dashboard
  console.log("\n⭐ Creating reviews...");
  const reviewsData = [
    {
      serviceId: services[0]._id,
      userId: clients[0]._id,
      rating: 5,
      comment: "Excelente casa, muy cómoda y bien ubicada. La recomiendo 100%",
    },
    {
      serviceId: services[0]._id,
      userId: clients[1]._id,
      rating: 4,
      comment: "Buena ubicación y limpia, solo faltó un poco más de ventilación",
    },
    {
      serviceId: services[1]._id,
      userId: clients[1]._id,
      rating: 5,
      comment: "Buen servicio de taxi, puntual y seguro. El conductor muy amable",
    },
    {
      serviceId: services[1]._id,
      userId: clients[2]._id,
      rating: 4,
      comment: "Servicio confiable, llegó a tiempo",
    },
    {
      serviceId: services[2]._id,
      userId: clients[0]._id,
      rating: 5,
      comment: "Catering delicioso y atención impecable. Todos quedaron encantados",
    },
    {
      serviceId: services[3]._id,
      userId: clients[1]._id,
      rating: 4,
      comment: "Agua de buena calidad y entrega rápida",
    },
    {
      serviceId: services[4]._id,
      userId: clients[2]._id,
      rating: 5,
      comment: "Hotel muy limpio y cómodo, excelente ubicación",
    },
    {
      serviceId: services[5]._id,
      userId: clients[0]._id,
      rating: 5,
      comment: "Tour increíble, aprendí mucho sobre la gastronomía peruana",
    },
  ];

  const reviews = await Review.insertMany(reviewsData);
  console.log(`✓ Created ${reviews.length} reviews`);

  // Create sample orders from clients for different services
  console.log("\n📦 Creating orders...");
  const now = new Date();
  const ordersData = [
    {
      clientId: clients[0]._id,
      serviceId: services[0]._id,
      affiliateId: services[0].affiliateId,
      amount: services[0].price,
      commission: Number((services[0].price * 0.05).toFixed(2)),
      currency: "PEN",
      paymentMethod: "mercado_pago",
      paymentStatus: "completed",
      status: "completed",
      scheduledDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      address: "Jr. Ucayali 234, Centro Histórico, Lima",
      contactInfo: {
        name: clients[0].name,
        phone: clients[0].phone,
        email: clients[0].email,
      },
      bookingDetails: {
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "10:00",
        quantity: 1,
      },
    },
    {
      clientId: clients[1]._id,
      serviceId: services[1]._id,
      affiliateId: services[1].affiliateId,
      amount: services[1].price,
      commission: Number((services[1].price * 0.05).toFixed(2)),
      currency: "PEN",
      paymentMethod: "yape",
      paymentStatus: "completed",
      status: "completed",
      scheduledDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      address: "Av. Larco 567, Miraflores, Lima",
      contactInfo: {
        name: clients[1].name,
        phone: clients[1].phone,
        email: clients[1].email,
      },
      bookingDetails: {
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "14:30",
        quantity: 1,
      },
    },
    {
      clientId: clients[0]._id,
      serviceId: services[2]._id,
      affiliateId: services[2].affiliateId,
      amount: services[2].price * 3,
      commission: Number((services[2].price * 3 * 0.05).toFixed(2)),
      currency: "PEN",
      paymentMethod: "mercado_pago",
      paymentStatus: "completed",
      status: "completed",
      scheduledDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      address: "Av. Brasil 890, Pueblo Libre, Lima",
      contactInfo: {
        name: clients[0].name,
        phone: clients[0].phone,
        email: clients[0].email,
      },
      bookingDetails: {
        date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "18:00",
        quantity: 3,
      },
    },
    {
      clientId: clients[2]._id,
      serviceId: services[4]._id,
      affiliateId: services[4].affiliateId,
      amount: services[4].price * 2,
      commission: Number((services[4].price * 2 * 0.05).toFixed(2)),
      currency: "PEN",
      paymentMethod: "card",
      paymentStatus: "completed",
      status: "completed",
      scheduledDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      address: "Plaza Mayor, Centro de Lima",
      contactInfo: {
        name: clients[2].name,
        phone: clients[2].phone,
        email: clients[2].email,
      },
      bookingDetails: {
        date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "15:00",
        quantity: 2,
      },
    },
    {
      clientId: clients[1]._id,
      serviceId: services[3]._id,
      affiliateId: services[3].affiliateId,
      amount: services[3].price * 5,
      commission: Number((services[3].price * 5 * 0.05).toFixed(2)),
      currency: "PEN",
      paymentMethod: "plin",
      paymentStatus: "completed",
      status: "in_progress",
      scheduledDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      address: "San Isidro, Lima",
      contactInfo: {
        name: clients[1].name,
        phone: clients[1].phone,
        email: clients[1].email,
      },
      bookingDetails: {
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "09:00",
        quantity: 5,
      },
    },
    {
      clientId: clients[0]._id,
      serviceId: services[5]._id,
      affiliateId: services[5].affiliateId,
      amount: services[5].price * 2,
      commission: Number((services[5].price * 2 * 0.05).toFixed(2)),
      currency: "PEN",
      paymentMethod: "mercado_pago",
      paymentStatus: "pending",
      status: "pending",
      scheduledDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      address: "Miraflores, Lima",
      contactInfo: {
        name: clients[0].name,
        phone: clients[0].phone,
        email: clients[0].email,
      },
      bookingDetails: {
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: "10:00",
        quantity: 2,
      },
    },
  ];

  const orders = await Order.insertMany(ordersData);
  console.log(`✓ Created ${orders.length} orders`);

  // Create transactions for completed orders
  console.log("\n💳 Creating transactions...");
  const transactions = await Promise.all(
    orders
      .filter((order) => order.paymentStatus === "completed")
      .map(async (order) => {
        const platformAmount = order.commission;
        const affiliateAmount = Number(
          (order.amount - order.commission).toFixed(2),
        );

        return await Transaction.create({
          orderId: order._id,
          affiliateAmount,
          platformAmount,
          paymentGatewayId: `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: "completed",
        });
      }),
  );

  console.log(`✓ Created ${transactions.length} transactions`);

  // Create notifications for users
  console.log("\n🔔 Creating notifications...");
  const notificationsData = [
    {
      userId: clients[0]._id,
      type: "order_completed",
      title: "Pedido Completado",
      message: "Tu pedido ha sido completado exitosamente",
      data: {
        orderId: orders[0]._id,
        serviceId: services[0]._id,
        amount: orders[0].amount,
      },
      read: false,
      priority: "normal",
    },
    {
      userId: approvedAffiliates[0]._id,
      type: "payment_received",
      title: "Pago Recibido",
      message: `Has recibido un pago de S/ ${transactions[0].affiliateAmount}`,
      data: {
        orderId: orders[0]._id,
        amount: transactions[0].affiliateAmount,
      },
      read: true,
      readAt: new Date(),
      priority: "high",
    },
    {
      userId: clients[1]._id,
      type: "order_confirmed",
      title: "Pedido Confirmado",
      message: "Tu pedido ha sido confirmado por el proveedor",
      data: {
        orderId: orders[1]._id,
        serviceId: services[1]._id,
      },
      read: false,
      priority: "normal",
    },
    {
      userId: approvedAffiliates[2]._id,
      type: "order_new",
      title: "Nuevo Pedido",
      message: "Tienes un nuevo pedido pendiente",
      data: {
        orderId: orders[5]._id,
        serviceId: services[5]._id,
        amount: orders[5].amount,
      },
      read: false,
      priority: "high",
    },
    {
      userId: affiliateUsers[3]._id,
      type: "affiliate_approved",
      title: "Solicitud Aprobada",
      message: "Tu solicitud de afiliado ha sido aprobada. Ya puedes publicar servicios.",
      read: false,
      priority: "urgent",
    },
  ];

  const notifications = await Notification.insertMany(notificationsData);
  console.log(`✓ Created ${notifications.length} notifications`);

  // Create a sample dispute
  console.log("\n⚠️  Creating disputes...");
  const disputesData = [
    {
      orderId: orders[0]._id,
      reportedBy: clients[0]._id,
      reportedAgainst: approvedAffiliates[0]._id,
      type: "communication_issue",
      title: "Problema de comunicación",
      description: "El proveedor no respondió mis mensajes durante 2 días",
      evidence: [],
      status: "resolved",
      priority: "medium",
      resolution: {
        decision: "Se contactó al proveedor y se resolvió el problema",
        action: "Advertencia al proveedor",
        notes: "El proveedor se comprometió a mejorar su tiempo de respuesta",
        resolvedBy: admin._id,
        resolvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      messages: [
        {
          userId: clients[0]._id,
          message: "No he recibido respuesta del proveedor",
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          userId: admin._id,
          message: "Estamos revisando tu caso",
          createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          userId: approvedAffiliates[0]._id,
          message: "Disculpas por la demora, tuve un problema personal",
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
      ],
    },
  ];

  const disputes = await Dispute.insertMany(disputesData);
  console.log(`✓ Created ${disputes.length} disputes`);

  // Create affiliate payments
  console.log("\n💰 Creating affiliate payments...");
  const completedTransactions = transactions.filter(t => t.status === "completed");
  
  if (completedTransactions.length > 0) {
    const affiliatePaymentsData = [
      {
        affiliateId: approvedAffiliates[0]._id,
        amount: completedTransactions
          .filter(t => orders.find(o => o._id.equals(t.orderId) && o.affiliateId.equals(approvedAffiliates[0]._id)))
          .reduce((sum, t) => sum + t.affiliateAmount, 0),
        currency: "PEN",
        transactionIds: completedTransactions
          .filter(t => orders.find(o => o._id.equals(t.orderId) && o.affiliateId.equals(approvedAffiliates[0]._id)))
          .map(t => t._id),
        paymentMethod: "bank_transfer",
        paymentDetails: {
          referenceNumber: "OP-2024-001234",
          accountNumber: "191001000000",
          bank: "BCP",
        },
        receiptImage: "https://example.com/receipts/payment1.jpg",
        status: "completed",
        processedBy: admin._id,
        processedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        scheduledDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        completedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        affiliateId: approvedAffiliates[1]._id,
        amount: completedTransactions
          .filter(t => orders.find(o => o._id.equals(t.orderId) && o.affiliateId.equals(approvedAffiliates[1]._id)))
          .reduce((sum, t) => sum + t.affiliateAmount, 0),
        currency: "PEN",
        transactionIds: completedTransactions
          .filter(t => orders.find(o => o._id.equals(t.orderId) && o.affiliateId.equals(approvedAffiliates[1]._id)))
          .map(t => t._id),
        paymentMethod: "yape",
        paymentDetails: {
          phone: approvedAffiliates[1].phone,
          referenceNumber: "YAPE-2024-5678",
        },
        status: "pending",
        scheduledDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        notes: "Pago programado para mañana",
      },
    ];

    const affiliatePayments = await AffiliatePayment.insertMany(affiliatePaymentsData);
    console.log(`✓ Created ${affiliatePayments.length} affiliate payments`);
  }

  // Update affiliate statistics
  console.log("\n📊 Updating affiliate statistics...");
  for (const affiliate of affiliateProfiles) {
    const affiliateOrders = orders.filter(o => o.affiliateId.equals(affiliate.affiliateId));
    const affiliateTransactions = transactions.filter(t => 
      affiliateOrders.some(o => o._id.equals(t.orderId))
    );
    const affiliateServices = services.filter(s => s.affiliateId.equals(affiliate.affiliateId));
    const affiliateReviews = reviews.filter(r => 
      affiliateServices.some(s => s._id.equals(r.serviceId))
    );

    const totalEarnings = affiliateTransactions.reduce((sum, t) => sum + t.affiliateAmount, 0);
    const avgRating = affiliateReviews.length > 0
      ? affiliateReviews.reduce((sum, r) => sum + r.rating, 0) / affiliateReviews.length
      : 0;

    await Affiliate.findByIdAndUpdate(affiliate._id, {
      totalEarnings: Number(totalEarnings.toFixed(2)),
      totalServices: affiliateServices.length,
      rating: Number(avgRating.toFixed(1)),
      reviewCount: affiliateReviews.length,
    });
  }
  console.log("✓ Affiliate statistics updated");

  console.log("\n✅ Seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${clients.length} clients`);
  console.log(`   - ${affiliateUsers.length} affiliates`);
  console.log(`   - ${services.length} services`);
  console.log(`   - ${orders.length} orders`);
  console.log(`   - ${transactions.length} transactions`);
  console.log(`   - ${reviews.length} reviews`);
  console.log(`   - ${notifications.length} notifications`);
  console.log(`   - ${disputes.length} disputes`);
  
  console.log("\n🔐 Test Credentials:");
  console.log("   Admin: admin@amazongroup.com / admin123");
  console.log("   Client: ana.garcia@example.com / 123456");
  console.log("   Affiliate: maria.gonzalez@example.com / 123456");
  
  process.exit(0);
}

up().catch((err) => {
  console.error("Seeder failed", err);
  process.exit(1);
});
