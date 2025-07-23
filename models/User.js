const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  password: { type: String, required: true },
  isBot: { type: Boolean, default: false }
}, { collection: "login" });

module.exports = mongoose.model("User", UserSchema, "login");
