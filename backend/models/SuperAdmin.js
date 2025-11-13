import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  cin: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
