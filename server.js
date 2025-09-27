const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// AGGRESSIVE CORS FIX - Set headers for ALL requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  console.log(`🌐 CORS Request - Method: ${req.method}, Origin: ${origin}, URL: ${req.url}`);
  
  // ALWAYS set CORS headers for fmsplugin.vercel.app
  res.setHeader('Access-Control-Allow-Origin', 'https://fmsplugin.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Origin,Content-Type,Authorization,X-Requested-With,Accept');
  res.setHeader('Access-Control-Max-Age', '3600');
  
  // Also allow other origins if needed
  const allowedOrigins = [
    'https://fmsplugin.vercel.app',
    'https://fms-chat.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    res.status(204).end();
    return;
  }
  
  console.log('✅ CORS headers set, continuing to route...');
  next();
});
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
  res.send("🚀 FestieChat Backend Running...");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  console.log('🏥 Health check called - Origin:', req.headers.origin);
  
  res.json({
    success: true,
    message: "FestieChat Backend - AGGRESSIVE CORS FIX v2.3",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: "2.3.0",
    features: ["Enhanced Chat System", "JWT Authentication", "AGGRESSIVE CORS Fix"],
    cors: {
      primaryOrigin: 'https://fmsplugin.vercel.app',
      requestOrigin: req.headers.origin || 'no-origin',
      status: 'AGGRESSIVE_ALWAYS_ALLOW',
      method: 'Always set Access-Control-Allow-Origin',
      headersSet: [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Credentials', 
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers'
      ]
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
