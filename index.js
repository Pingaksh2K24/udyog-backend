import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Customer from "./models/Customer.js";
import Supplier from "./models/Supplier.js";
import authRoutes from "./routes/authRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// __dirname setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚡ Serve uploads folder (images, pdf, docs, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/udyog_retailersDB";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// Health route
app.get("/", (_req, res) =>
  res.json("Udyog Sutra Backend Running on Prasad Test 🚀")
);

// Database connection test
app.get("/api/db-test", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    res.json({
      connected: dbStatus === 1,
      database: mongoose.connection.name,
      collections: collections.map((c) => c.name),
      status: dbStatus === 1 ? "Connected" : "Disconnected",
    });
  } catch (error) {
    res.status(500).json({ error: error.message, connected: false });
  }
});

// Auth routes
app.use("/api/auth", authRoutes);

// Settings routes
app.use("/api/settings", settingsRoutes);

// Supplier routes
app.use("/api/suppliers", supplierRoutes);

// Customer routes
app.use("/api/customers", customerRoutes);

// Products route
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders route
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





// Check suppliers data structure
app.get("/api/suppliers-raw", async (req, res) => {
  try {
    const suppliers = await mongoose.connection.db
      .collection("suppliers")
      .find({})
      .limit(2)
      .toArray();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check existing users (temporary)
app.get("/api/check-users", async (req, res) => {
  try {
    const users = await mongoose.connection.db
      .collection("ser")
      .find({})
      .limit(2)
      .toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test specific user
app.get("/api/test-user/:email", async (req, res) => {
  try {
    const user = await mongoose.connection.db
      .collection("ser")
      .findOne({ email: req.params.email });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List products
app.get("/api/products", async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// Get all users API
app.get("/api/users", async (req, res) => {
  try {
    const users = await mongoose.connection.db
      .collection("users")
      .find({}, {
        projection: {
          _id: 0,
          passwordHash: 0
        }
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user API
app.post("/api/create-user", async (req, res) => {
  try {
    const { fullName, email, phone, password, role, businessName, address } = req.body;
    const bcrypt = await import('bcryptjs');
    
    // Check if user exists
    const existingUser = await mongoose.connection.db
      .collection("users")
      .findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.default.genSalt(10);
    const passwordHash = await bcrypt.default.hash(password, salt);
    
    // Generate user_id
    const userCount = await mongoose.connection.db.collection("users").countDocuments();
    const user_id = `USR${String(userCount + 1).padStart(4, '0')}`;
    
    // Create user object
    const newUser = {
      fullName,
      email,
      phone,
      passwordHash,
      role: role || "retailer",
      businessName,
      address: address || {},
      status: "active",
      createdAt: new Date(),
      createdBy: null,
      updatedAt: null,
      updatedBy: null,
      deletedAt: null,
      deletedBy: null,
      user_id
    };
    
    const result = await mongoose.connection.db
      .collection("users")
      .insertOne(newUser);
    
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: result.insertedId,
        fullName,
        email,
        role: newUser.role,
        businessName,
        user_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`⚡ Server running on port ${PORT}`));
