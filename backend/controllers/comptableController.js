import { comptable } from "../models/Comptable.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerComptable = async (req, res) => {
  try {
    const { name, lastname, cin, email, password } = req.body;

    // Check if user already exists
    const existing = await comptable.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new comptable
    const newComptable = new comptable({ name, lastname, cin, email, password });
    await newComptable.save();

    res.status(201).json({ message: "Comptable created successfully", comptable: newComptable });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const loginComptable = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find comptable by email
    const user = await comptable.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: "comptable" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        cin: user.cin,
        email: user.email,
        role: "comptable",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
