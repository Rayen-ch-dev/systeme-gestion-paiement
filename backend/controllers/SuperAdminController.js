import { SuperAdmin } from "../models/SuperAdmin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, lastname, cin, email, password } = req.body;

    // Check required fields
    if (!name || !lastname || !cin || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // Check if SuperAdmin already exists
    const existingUser = await SuperAdmin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new SuperAdmin
    const newSuperAdmin = new SuperAdmin({
      name,
      lastname,
      cin,
      email,
      password: hashedPassword,
    });

    await newSuperAdmin.save();

    res.status(201).json({
      message: "Super administrateur créé avec succès",
      user: {
        id: newSuperAdmin._id,
        name: newSuperAdmin.name,
        lastname: newSuperAdmin.lastname,
        cin: newSuperAdmin.cin,
        email: newSuperAdmin.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'inscription", error: error.message });
  }
};


export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Find SuperAdmin by email
    const user = await SuperAdmin.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email ou mot de passe invalide" });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email ou mot de passe invalide" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: "super_admin" },
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
        cin: user.cin,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
