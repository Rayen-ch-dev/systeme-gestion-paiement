import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    const { name, lastname, cin, email, password, role, banque, specialite, fonction } = req.body;

    // Champs de base obligatoires
    if (!name || !lastname || !cin || !email || !password || !role) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // Champs spécifiques selon le rôle
    if (role === "formateur") {
      if (!specialite) {
        return res.status(400).json({ message: "Le champ spécialité est obligatoire pour les formateurs" });
      }
      // CORRECTION : Supprimer la validation du RIB
      if (!banque) {
        return res.status(400).json({ message: "La banque est obligatoire pour les formateurs" });
      }
    }

    if (role === "coordinateur") {
      if (!fonction) {
        return res.status(400).json({ message: "Le champ fonction est obligatoire pour les coordinateurs" });
      }
      // CORRECTION : Supprimer la validation du RIB
      if (!banque) {
        return res.status(400).json({ message: "La banque est obligatoire pour les coordinateurs" });
      }
    }

    // Créer l'utilisateur SANS valider le RIB
    const newUser = new User({
      name,
      lastname,
      cin,
      email,
      password,
      role,
      banque,
      rib: '', // RIB vide par défaut
      specialite,
      fonction
    });

    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      console.log("Duplicate key error:", error.keyPattern, error.keyValue);
      return res.status(400).json({ 
        message: "Email ou CIN déjà utilisé",
        details: error.keyPattern
      });
    }
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id, name, lastname, cin, email, password, banque, rib, specialite, fonction } = req.body;
    
    const updateData = {
      name,
      lastname,
      cin,
      email,
      banque,
      rib,
      specialite,
      fonction
    };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    res.json({ ok: true, profile: user });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}

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

    if ((user.role === "formateur" || user.role === "coordinateur") && user.status !== "approuvé") {
      return res.status(403).json({ message: "Compte en attente de validation", status: user.status });
    }

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
        cin: user.cin,
        email: user.email,
        password: user.password,
        rib: user.rib,
        banque: user.banque,
        role: user.role,
        specialite: user.specialite,
        fonction: user.fonction,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params; 
    const result = await User.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
      return res.status(200).json({
        message: "User deleted successfully",
      });
    } else {
      return res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

export const UpdateUser = async(req, res) => {
  try {
    const { id } = req.params;
    const UpdatedData = req.body;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.status === "en-attente") {
      return res.status(400).json({
        message: "Can't update pending users",
      });
    }

    const user = await User.findByIdAndUpdate(id, UpdatedData, {
      new: true, 
      runValidators: true, 
    });

    res.status(200).json({
      message: "User Updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

export const getUser = async(req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        message: "User Not Found"
      });
    }
    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const filteredUsers = users.filter(user => user.role !== "super_admin");

    if (filteredUsers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message  
    });
  }
};