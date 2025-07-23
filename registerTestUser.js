const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function registerTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const userId = "testuser";
    const password = "testpassword";

    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      console.log("Test user already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ userId, password: hashedPassword, isBot: false });
    await newUser.save();
    console.log("Test user registered successfully.");
    console.log(`UserID: ${userId}, Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Error registering test user:", error);
    process.exit(1);
  }
}

registerTestUser();
