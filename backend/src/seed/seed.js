/* Simple seeder for the backend
   This script connects to MongoDB using the existing connectMongo helper,
   and inserts example documents for Category, User (client + affiliate), Affiliate,
   Service, Order and Transaction.

   Usage: node src/seed/seed.js
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

async function up() {
  await connectMongo();

  console.log(
    "Clearing collections (categories, users, affiliates, services, orders, transactions)",
  );
  try {
    await Promise.all([
      Category.deleteMany({}),
      User.deleteMany({}),
      Affiliate.deleteMany({}),
      Service.deleteMany({}),
      Order.deleteMany({}),
      Transaction.deleteMany({}),
      Review.deleteMany({}),
    ]);
  } catch (err) {
    console.error("Error clearing collections", err);
  }

  // Create categories that match frontend service types
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
  console.log(`Inserted ${categories.length} categories`);

  // Create users: clients, affiliates and admin
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
      address: "Av. Larco 1234, Miraflores, Lima",
    },
    {
      role: "client",
      name: "Carlos Mendoza",
      email: "carlos.mendoza@example.com",
      phone: "+51987654321",
      password: clientPassword,
      address: "Jr. Huancavelica 567, Centro, Lima",
    },
  ]);

  const affiliateUsers = await User.insertMany([
    {
      role: "affiliate",
      name: "María González",
      email: "maria.gonzalez@example.com",
      phone: "+51987111222",
      password: affiliatePassword,
      address: "Av. Brasil 890, Pueblo Libre, Lima",
      bio: "Especialista en alquiler de propiedades con 5 años de experiencia",
    },
    {
      role: "affiliate",
      name: "José Rodríguez",
      email: "jose.rodriguez@example.com",
      phone: "+51987333444",
      password: affiliatePassword,
      address: "Av. Arequipa 456, San Isidro, Lima",
      bio: "Conductor profesional con vehículo propio, disponible 24/7",
    },
    {
      role: "affiliate",
      name: "Carmen López",
      email: "carmen.lopez@example.com",
      phone: "+51987555666",
      password: affiliatePassword,
      address: "Calle Las Flores 123, San Borja, Lima",
      bio: "Chef profesional con experiencia en eventos y catering",
    },
  ]);

  const admin = await User.create({
    role: "admin",
    name: "Admin System",
    email: "admin@amazongroup.com",
    phone: "+51900000000",
    password: adminPassword,
  });

  console.log(
    "Created users:",
    clients.length,
    "clients,",
    affiliateUsers.length,
    "affiliates, 1 admin",
  );

  // Create affiliate profiles
  const affiliateProfiles = await Promise.all(
    affiliateUsers.map(async (user, index) => {
      return await Affiliate.create({
        affiliateId: user._id,
        dni: `${12345678 + index}`,
        status: "approved",
        termsAccepted: true,
      });
    }),
  );

  console.log("Created affiliate profiles for", affiliateUsers.length, "users");

  // Create services by different affiliates
  const servicesData = [
    {
      affiliateId: affiliateUsers[0]._id,
      category: "Casas",
      title: "Casa en Alquiler - Centro Histórico",
      description:
        "Hermosa casa colonial de 3 habitaciones, 2 baños, completamente amueblada en el corazón del centro histórico de Lima. Cuenta con cocina equipada, sala-comedor espaciosa, patio interior y excelente ubicación cerca de museos, restaurantes y transporte público.",
      price: 800,
      images: [],
      location: {
        lat: -12.0464,
        lng: -77.0428,
        address: "Jr. Ucayali 234, Centro Histórico, Lima",
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
    },
    {
      affiliateId: affiliateUsers[1]._id,
      category: "Taxis",
      title: "Taxi Seguro 24/7",
      description:
        "Servicio de taxi confiable y seguro disponible las 24 horas del día. Vehículo en excelente estado, conductor con experiencia de más de 5 años. Ideal para traslados al aeropuerto, citas médicas, reuniones de trabajo o cualquier destino en Lima y alrededores.",
      price: 25,
      images: [],
      location: { lat: -12.1, lng: -77.05, address: "Toda Lima Metropolitana" },
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
    },
    {
      affiliateId: affiliateUsers[2]._id,
      category: "Restaurantes",
      title: "Catering El Buen Sabor",
      description:
        "Servicio de catering profesional para eventos, reuniones corporativas, celebraciones familiares y ocasiones especiales. Ofrecemos comida peruana tradicional e internacional preparada con ingredientes frescos y de primera calidad.",
      price: 35,
      images: [],
      location: { lat: -12.08, lng: -77.03, address: "San Borja, Lima" },
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
    },
    {
      affiliateId: affiliateUsers[0]._id,
      category: "Agua",
      title: "Distribución de Agua Purificada",
      description:
        "Servicio de entrega de agua purificada a domicilio. Bidones de 20 litros con agua tratada con los más altos estándares de calidad. Entrega puntual y servicio confiable para hogares y oficinas.",
      price: 15,
      images: [],
      location: { lat: -12.06, lng: -77.04, address: "Lima Metropolitana" },
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
    },
    {
      affiliateId: affiliateUsers[1]._id,
      category: "Hoteles",
      title: "Hotel Boutique Plaza",
      description:
        "Hotel boutique en el centro de Lima con habitaciones elegantes y modernas. Perfecto para viajeros de negocios y turistas que buscan comodidad y ubicación estratégica. Incluye desayuno buffet y WiFi gratuito.",
      price: 120,
      images: [],
      location: {
        lat: -12.045,
        lng: -77.035,
        address: "Plaza Mayor, Centro de Lima",
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
    },
    {
      affiliateId: affiliateUsers[2]._id,
      category: "Lugares Turísticos",
      title: "Tour Gastronómico Lima",
      description:
        "Recorrido gastronómico por los mejores restaurantes y mercados de Lima. Conoce la rica tradición culinaria peruana de la mano de guías expertos. Incluye degustaciones, visitas a mercados tradicionales y restaurantes reconocidos.",
      price: 80,
      images: [],
      location: {
        lat: -12.05,
        lng: -77.045,
        address: "Centro de Lima y Miraflores",
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
    },
  ];

  const services = await Service.insertMany(servicesData);
  console.log(`Created ${services.length} services`);

  // Create sample reviews to provide ratings for dashboard
  const reviewsData = [
    {
      serviceId: services[0]._id,
      userId: clients[0]._id,
      rating: 5,
      comment: "Excelente casa, muy cómoda y bien ubicada",
    },
    {
      serviceId: services[1]._id,
      userId: clients[1]._id,
      rating: 4,
      comment: "Buen servicio de taxi, puntual y seguro",
    },
    {
      serviceId: services[2]._id,
      userId: clients[0]._id,
      rating: 5,
      comment: "Catering delicioso y atención impecable",
    },
    {
      serviceId: services[3]._id,
      userId: clients[1]._id,
      rating: 4,
      comment: "Agua de buena calidad y entrega rápida",
    },
  ];

  const reviews = await Review.insertMany(reviewsData);
  console.log(`Created ${reviews.length} reviews`);

  // Create sample orders from clients for different services
  const ordersData = [
    {
      clientId: clients[0]._id,
      serviceId: services[0]._id,
      affiliateId: services[0].affiliateId,
      amount: services[0].price,
      commission: Number((services[0].price * 0.05).toFixed(2)),
      paymentMethod: "card",
      paymentStatus: "completed",
      status: "confirmed",
      scheduledDate: new Date("2024-02-15"),
      address: "Jr. Ucayali 234, Centro Histórico, Lima",
      contactInfo: {
        name: clients[0].name,
        phone: clients[0].phone,
        email: clients[0].email,
      },
    },
    {
      clientId: clients[1]._id,
      serviceId: services[1]._id,
      affiliateId: services[1].affiliateId,
      amount: services[1].price,
      commission: Number((services[1].price * 0.05).toFixed(2)),
      paymentMethod: "cash",
      paymentStatus: "pending",
      status: "pending",
      scheduledDate: new Date("2024-02-20"),
      address: "Av. Larco 567, Miraflores, Lima",
      contactInfo: {
        name: clients[1].name,
        phone: clients[1].phone,
        email: clients[1].email,
      },
    },
    {
      clientId: clients[0]._id,
      serviceId: services[2]._id,
      affiliateId: services[2].affiliateId,
      amount: services[2].price * 3, // 3 personas
      commission: Number((services[2].price * 3 * 0.05).toFixed(2)),
      paymentMethod: "transfer",
      paymentStatus: "completed",
      status: "completed",
      scheduledDate: new Date("2024-01-25"),
      address: "Av. Brasil 890, Pueblo Libre, Lima",
      contactInfo: {
        name: clients[0].name,
        phone: clients[0].phone,
        email: clients[0].email,
      },
    },
  ];

  const orders = await Order.insertMany(ordersData);
  console.log(`Created ${orders.length} orders`);

  // Create transactions for completed orders
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
          paymentGatewayId: `gw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: "completed",
        });
      }),
  );

  console.log(`Created ${transactions.length} transactions`);

  console.log("Seeding completed.");
  process.exit(0);
}

up().catch((err) => {
  console.error("Seeder failed", err);
  process.exit(1);
});
