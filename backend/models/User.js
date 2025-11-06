import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    
  },
  cin: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["super_admin","formateur", "coordinateur"],
    default: "formateur",
  },
  status: {
    type: String,
    enum: ["en-attente", "approuvé", "non-approuvé"],
    default: "en-attente",
    required: function() { return this.role !== "super_admin" && this.role !== "comptable"; }
  },
  rib: {
    type: String, 
    required: function() { return this.role !== "super_admin"; },
    unique : true,
  },
  banque: {
    type: String, 
    required: function() { return this.role !== "super_admin"; },
  },
   role: {
    type: String,
    enum: ["super_admin","formateur", "coordinateur"],
    default: "formateur",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const User = mongoose.model("User", userSchema);
