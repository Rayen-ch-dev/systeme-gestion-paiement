import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config();

const createSuperAdmin = async () => {
  const existing = await User.findOne({ email: "admin@example.com" });
  if (existing) return console.log("Super admin already exists");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = new User({
    name: "Admin",
    lastname: "Root",
    cin: "00000000",
    email: "admin@example.com",
    password: hashedPassword,
    role: "super_admin",
  });

  await admin.save();
  console.log("Super admin created");
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => createSuperAdmin())
  .catch(err => console.error(err));
