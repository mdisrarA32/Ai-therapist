import dotenv from "dotenv";
// Load environment variables immediately
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { serve } from "inngest/express";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import therapyRouter from "./routes/therapyRoutes";
import { connectDB } from "./utils/db";
import { inngest } from "./inngest/client";
import { functions as inngestFunctions } from "./inngest/functions";
import dashboardRouter from "./routes/dashboardRoutes";
import http from "http";
import { initSocket } from "./socket";
// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
// Cors Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};
app.use(cors(corsOptions)); // Enable secure CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // HTTP request logger

// Set up Inngest endpoint
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions })
);
// OnaF6EGHhgYY9OPv

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/mood", moodRouter); // Alias for frontend
app.use("/api/activity", activityRouter);
app.use("/activity", activityRouter); // Alias for frontend
app.use("/api/activities", activityRouter); // Dashboard alias
app.use("/activities", activityRouter); // Alias for frontend
app.use("/api/therapy", therapyRouter);
app.use("/api/dashboard", dashboardRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start the server
    const initialPort = parseInt(process.env.PORT || "3001", 10);

    const startWithPort = (port: number) => {
      const server = http.createServer(app);
      initSocket(server);

      server.listen(port);

      server.on("listening", () => {
        logger.info(`Server is running on port ${port}`);
        logger.info(
          `Inngest endpoint available at http://localhost:${port}/api/inngest`
        );
      });

      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          logger.warn(`⚠️  Port ${port} is already in use.`);
          logger.warn(`🔄 Attempting to start server on port ${port + 1}...`);
          // Gracefully try the next port 
          startWithPort(port + 1);
        } else {
          logger.error("Failed to start server:", err);
          process.exit(1);
        }
      });
    };

    startWithPort(initialPort);
  } catch (error) {
    logger.error("Failed to initialize server requirements:", error);
    process.exit(1);
  }
};

startServer();
