import { User } from "../models/User.js";


export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: " User created", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: " Error creating user", error: error.message });
  }
};