require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Allow sending JSON data

// --- CONFIGURATION ---
// PASTE YOUR ATLAS STRING HERE ↓ (Replace <db_password>)
const MONGO_URI = "mongodb+srv://admin:banksec123@banksec-cluster.kstxztx.mongodb.net/?appName=BankSEC-Cluster";

// --- CONNECT TO DATABASE ---
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- DEFINE USER SCHEMA (The Blueprint) ---
const UserSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true }, // Wallet Address
  name: { type: String, required: true },
  email: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  kycVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// --- API ROUTES ---

// 1. LOGIN (Check if user exists)
app.post('/api/login', async (req, res) => {
    
  const { address } = req.body;
//   const { address } = req.body;
  const lowerAddr = address.toLowerCase(); // <--- Force Lowercase
  try {
    const user = await User.findOne({ address: lowerAddr });
//   try {
//     const user = await User.findOne({ address: address });
    if (user) {
      res.json({ exists: true, user: user });
    } else {
      res.json({ exists: false }); // User needs to signup
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. SIGNUP (Create new user)
app.post('/api/signup', async (req, res) => {
//   const { address, name, email, role } = req.body;
  const { address, name, email, role } = req.body;
  const lowerAddr = address.toLowerCase(); // <--- Force Lowercase
  try {
    const newUser = new User({ address: lowerAddr, name, email, role });
//   try {
//     const newUser = new User({ address, name, email, role });
    await newUser.save();
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET ALL USERS (For Admin Panel)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});