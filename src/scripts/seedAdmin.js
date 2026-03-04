/**
 * Admin Seeder Script
 *
 * This script creates a hardcoded admin user in the database.
 * Run this script once after setting up the database.
 *
 * Usage: node src/scripts/seedAdmin.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../Models/Users.js";
import { encrypt } from "../utils/encrypt.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@votesecure.edu";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
const ADMIN_NAME = process.env.ADMIN_NAME || "System Administrator";

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists:");
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log("   No changes made.");
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await encrypt.hash(ADMIN_PASSWORD);

    // Create admin user
    const adminUser = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
      isEmailVerified: true,
    });

    console.log("✅ Admin user created successfully!");
    console.log("─────────────────────────────────");
    console.log("📧 Email:", ADMIN_EMAIL);
    console.log("🔑 Password:", ADMIN_PASSWORD);
    console.log("👤 Name:", ADMIN_NAME);
    console.log("🆔 User ID:", adminUser._id);
    console.log("─────────────────────────────────");
    console.log("");
    console.log("⚠️  IMPORTANT: Change the password after first login!");
    console.log("⚠️  Store these credentials securely.");
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  }
};

seedAdmin();
