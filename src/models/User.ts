// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  userId: { type: String, unique: true, default: () => Math.random().toString(36).substring(2, 10) }
});

export default mongoose.model("User", UserSchema);
