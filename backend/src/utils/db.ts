import mongoose from "mongoose";
import { logger } from "./logger";

import dns from "node:dns";

// Fix for Node.js DNS querySrv ENOTFOUND on local/ISP DNS resolvers
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS servers is restricted
}

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is heavily required for production database connections.");
    }

    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB Atlas");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    // Do not exit the process, allow server to start without DB
    logger.warn("Server starting without database connection. Some features may not work.");
  }
};
