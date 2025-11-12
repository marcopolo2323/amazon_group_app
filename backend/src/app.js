require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { httpLogger } = require("./middleware/logger");
const errorHandler = require("./middleware/error");
const helmet = require("helmet");
const createError = require("http-errors");

const connectMongo = require("./config/mongo");

const routes = require("./routes");
const path = require("path");
const pages = require("./routes/pages");

const app = express();

// Security & logging
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
// CORS configuration for React Native
const corsOptions = {
  origin: [
    "http://localhost:8081", // Expo development server
    "http://localhost:3000", // Web development
    "http://localhost:19006", // Expo web
    "http://127.0.0.1:8081", // Localhost alternative
    "http://127.0.0.1:3000", // Localhost alternative web
    "http://192.168.56.1:8081", // Local network (VirtualBox IP)
    "http://192.168.1.176:8081", // Your actual WiFi network IP
    "http://10.0.2.2:8081", // Android emulator special IP
    "exp://localhost:19000", // Expo CLI
    "exp://127.0.0.1:19000", // Localhost alternative for Expo
    "exp://192.168.56.1:19000", // Expo CLI on network (VirtualBox)
    "exp://192.168.1.176:19000", // Expo CLI on network (WiFi)
    "exp://192.168.56.1:8081", // Expo development server on network (VirtualBox)
    "exp://192.168.1.176:8081", // Expo development server on network (WiFi)
    "exp://10.0.2.2:19000", // Android emulator Expo
    "http://localhost", // Plain localhost
    "http://127.0.0.1", // Plain 127.0.0.1
    "http://192.168.1.176", // Plain WiFi IP
    "*", // Allow all origins for development (remove in production)
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(httpLogger);
app.use(morgan("dev"));
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const maxReq = Number(process.env.RATE_LIMIT_MAX || 120);
app.use(rateLimit({ windowMs, max: maxReq }));

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// DB
connectMongo();

// Static uploads (serve images) with explicit headers to avoid CORP blocking
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads")),
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Amazon Group Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/", pages);
app.use("/api", routes);

// 404 handler
app.use((req, res, next) => {
  next(createError(404, "Not Found"));
});

// Error handler
app.use(errorHandler);

module.exports = app;
