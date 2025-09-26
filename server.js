import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
// Load environment variables

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://fms-chat.vercel.app",
      "https://festiechatplugin.vercel.app",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://fms-chat.vercel.app",
      "https://festiechatplugin.vercel.app",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(morgan("dev"));

// Compression middleware
app.use(compression());

// Handle preflight requests
app.options("*", cors());

// Database connection
import connectDB from "./config/database.js";
connectDB();

// Import admin utilities
import { initializeAdminSettings } from "./utils/adminUtils.js";


// Import activity tracking
import { trackActivity } from "./middleware/adminMiddleware.js";

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Activity tracking middleware (after auth)
app.use("/api", trackActivity);

// Import routes
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Apply rate limiting to different route groups
// app.use("/api/auth", authRateLimit);
// app.use("/api/messages", messageRateLimit);
// app.use("/api/chats", chatRateLimit);
// app.use("/api/users", generalRateLimit);

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message:
      "Festival Chat Plugin Backend is running! (No authentication required)",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      origin: req.headers.origin,
      userAgent: req.headers["user-agent"],
    },
  });
});

// Test endpoint for frontend connectivity
app.post("/api/test-connection", (req, res) => {
  res.json({
    success: true,
    message: "Connection test successful",
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      contentType: req.headers["content-type"],
      userAgent: req.headers["user-agent"],
    },
    body: req.body,
  });
});

// API endpoints - other endpoints in server.js for simplicity

app.get("/api/events", (req, res) => {
  res.json({
    success: true,
    message: "Events feature available (no auth required)",
    data: [],
  });
});

app.get("/api/competitions", (req, res) => {
  res.json({
    success: true,
    message: "Competitions feature available (no auth required)",
    data: [],
  });
});

app.get("/api/workshops", (req, res) => {
  res.json({
    success: true,
    message: "Workshops feature available (no auth required)",
    data: [],
  });
});

app.get("/api/participants", (req, res) => {
  res.json({
    success: true,
    message: "Participants feature available (no auth required)",
    data: [],
  });
});

app.get("/api/gallery", (req, res) => {
  res.json({
    success: true,
    message: "Gallery feature available (no auth required)",
    data: [],
  });
});

app.get("/api/results", (req, res) => {
  res.json({
    success: true,
    message: "Results feature available (no auth required)",
    data: [],
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join chat room
  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on("leave-chat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat ${chatId}`);
  });

  // Handle new message
  socket.on("send-message", (data) => {
    socket.to(data.chatId).emit("new-message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
🚀 Festival Chat Plugin Backend Server Running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
🔗 Health Check: http://localhost:${PORT}/health
📡 Socket.IO: Enabled
👑 Admin System: Enabled
🔄 Frontend Connections:
   - Local: http://localhost:5173
   - Production: https://fms-chat.vercel.app
`);

  // Initialize admin settings after server starts (non-blocking)
  initializeAdminSettings()
    .then(() => {
      console.log(`
🚀 Server running on port ${PORT}
📡 Socket.IO: Enabled
✅ Admin System: Active
🔄 Frontend Connections: 
   - Local: http://localhost:5173
   - Production: https://fms-chat.vercel.app
  `);
    })
    .catch((error) => {
      console.error("❌ Admin initialization failed:", error);
    });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  httpServer.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  httpServer.close(() => {
    console.log("Process terminated");
  });
});

export default app;
