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

  // Prevent password from being the same as the userId
  if (userId === password) {
    return res.status(400).json({ message: "Password cannot be the same as the User ID" });
  }

  try {
    // Find all users with the same userId
    const existingUsers = await User.find({ userId });

    // Check if any of these users have the same password
    for (const user of existingUsers) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.status(400)
          .json({ message: "This password has already been used for this User ID." });
      }
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
    // Find all users with the given userId, as multiple can exist
    const users = await User.find({ userId });
    if (!users || users.length === 0) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    let authenticatedUser = null;
    // Iterate through users to find one with a matching password
    for (const user of users) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        authenticatedUser = user;
        break; // Found the correct user
      }
    }

    if (!authenticatedUser) {
      console.log("Password mismatch for all users with this ID");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: authenticatedUser.userId, isBot: authenticatedUser.isBot },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful for userId:", userId);
    res.json({ token, userId: authenticatedUser.userId, isBot: authenticatedUser.isBot });
  } catch (error) {
    console.error(`Login error for userId '${userId}':`, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
