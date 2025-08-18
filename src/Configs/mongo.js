// src/config/mongo.js
import mongoose from "mongoose";

class MongoDb {
  constructor() {
    this.connection = mongoose.connection;

    // Attach events
    this.connection
      .on("open", () => console.info("✅ Database connection: open"))
      .on("close", () => console.info("❌ Database connection: close"))
      .on("disconnected", () => console.warn("⚠️ Database disconnected"))
      .on("reconnected", () => console.info("🔄 Database reconnected"))
      .on("error", (err) => {
        console.error("❌ Database connection error:", err);
      });
  }

  async connect(mongoUri) {
    try {
      mongoose.set("strictQuery", false); // optional
      await mongoose.connect(mongoUri);
      console.log("🚀 MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      throw error;
    }
  }

  async close() {
    try {
      await this.connection.close(false);
      console.log("🔌 MongoDB connection closed");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
    }
  }
}

// Export singleton instance
export { MongoDb };
