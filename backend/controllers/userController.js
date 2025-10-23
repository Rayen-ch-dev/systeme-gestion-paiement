import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    const { name, lastname,cin ,email, password } = req.body;

    if (!name || !lastname || !cin || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = new User({ name, lastname, cin ,email, password });
    await newUser.save();

    res.status(201).json({ message: " User created", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: " Error creating user", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        cin:user.cin,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message  });

  }
};
