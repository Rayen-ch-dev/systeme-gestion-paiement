import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ComptableSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,

    
  }
});


ComptableSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


export const comptable = mongoose.model("Comptable", ComptableSchema);
