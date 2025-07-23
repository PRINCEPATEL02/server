const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  const { userId, password, isBot } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ message: "UserId and password are required" });
  }

  try {
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: "UserId already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId,
      password: hashedPassword,
      isBot: isBot || false
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  console.log("Login attempt for userId:", userId);

  if (!userId || !password) {
    console.log("Missing userId or password");
    return res.status(400).json({ message: "UserId and password are required" });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.userId, isBot: user.isBot },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful for userId:", userId);
    res.json({ token, userId: user.userId, isBot: user.isBot });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
