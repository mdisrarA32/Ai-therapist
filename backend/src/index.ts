import dotenv from "dotenv";
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
import crisisRouter from "./routes/crisisRoutes";
import smsTestRoutes from "./routes/smsTest";
import http from "http";
import { initSocket } from "./socket";

const app = express();

// Security headers
app.use(helmet());

// CORS — allows localhost in dev, Vercel in production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  process.env.FRONTEND_URL || "",
].filter(Boolean);

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (
      process.env.NODE_ENV !== "production" ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Inngest
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions })
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Routes — all same as before
app.use("/api", smsTestRoutes);
app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/mood", moodRouter);
app.use("/api/activity", activityRouter);
app.use("/activity", activityRouter);
app.use("/api/activities", activityRouter);
app.use("/activities", activityRouter);
app.use("/api/therapy", therapyRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/crisis", crisisRouter);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = parseInt(process.env.PORT || "3002", 10);
    const server = http.createServer(app);

    initSocket(server);

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      logger.error("Server error:", err.message);
      process.exit(1);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received — shutting down gracefully");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error("Failed to initialize server:", error);
    process.exit(1);
  }
};

startServer();