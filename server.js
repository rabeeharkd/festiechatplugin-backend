const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ Allowed origins (local dev + deployed frontend)
const allowedOrigins = [
  "http://localhost:5173",              // React local dev
  "http://localhost:5174",              // React local dev  
  "http://localhost:5175",              // React local dev
  "http://localhost:5176",              // React local dev
  "http://localhost:3000",              // React local dev
  "https://fmsplugin.vercel.app",       // Your deployed frontend
  "https://fms-chat.vercel.app"         // Legacy frontend (can remove later)
];

// ✅ CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Enable cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Error:", err));

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "CORS is working 🎉", 
    backend: "FestieChat Backend", 
    status: "Running",
    version: "4.0.0 - Open Access Deployed",
    timestamp: new Date().toISOString(),
    features: ["Open Access Policy Active", "Join by Name", "Admin Plus Button"]
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working 🎉 - FestieChat Backend v3.0",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: "3.0.0",
    features: ["Enhanced Chat System", "JWT Authentication", "Clean CORS Configuration"],
    cors: {
      status: "PROPERLY_CONFIGURED",
      allowedOrigins: allowedOrigins,
      requestOrigin: req.headers.origin || 'no-origin',
      method: 'cors() middleware with origin function'
    }
  });
});

app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
});
