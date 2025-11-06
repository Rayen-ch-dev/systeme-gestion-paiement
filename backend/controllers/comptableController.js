import { Comptable } from "../models/Comptable.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerComptable = async (req, res) => {
  try {
    const { name, lastname, cin, email, password } = req.body;

    // Check if user already exists
    const existing = await Comptable.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new comptable
    const newComptable = new Comptable({ name, lastname, cin, email, password });
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
    const user = await Comptable.findOne({ email });
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

// get all  comptable
export const getAllComptables = async (req, res) => {
  try {
    const comptables = await Comptable.find();
    res.status(200).json(comptables);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get comptable by id
export const getComptableById = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await Comptable.findById(id);
    if (!found) return res.status(404).json({ message: "Comptable not found" });
    res.status(200).json(found);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE comptable
export const updateComptable = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lastname, cin, email, password } = req.body;

    const updateData = { name, lastname, cin, email };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await Comptable.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Comptable not found" });

    res.status(200).json({
      message: "Comptable updated successfully",
      comptable: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE comptable
export const deleteComptable = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Comptable.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Comptable not found" });

    res.status(200).json({ message: "Comptable deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Gestion des utilisateurs par le comptable

// Récupérer tous les utilisateurs avec filtrage par statut
export const getUsers = async (req, res) => {
  console.log('=== DEBUT getUsers ===');
  
  try {
    // Vérifier si l'utilisateur est authentifié et a le bon rôle
    if (!req.user || req.user.role !== 'comptable') {
      console.error('Accès non autorisé:', req.user ? `Rôle ${req.user.role}` : 'Non authentifié');
      return res.status(403).json({ 
        success: false,
        message: 'Accès non autorisé' 
      });
    }
    
    const { status = 'en-attente' } = req.query;
    console.log('Requête reçue avec le statut:', status);
    
    // Créer le filtre de base
    const filter = { 
      role: { $in: ['formateur', 'coordinateur'] }
    };

    // Ajouter le filtre de statut si spécifié et valide
    if (status && status !== 'tous') {
      filter.status = status;
    }
    
    console.log('Filtre appliqué:', JSON.stringify(filter));
    
    // Récupérer les utilisateurs avec le filtre
    const users = await User.find(filter)
      .select('-password -__v')
      .lean();
      
    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
    
    // S'assurer que chaque utilisateur a un statut valide
    const validatedUsers = users.map(user => ({
      ...user,
      _id: user._id.toString(), // Convertir ObjectId en string
      status: user.status || 'en-attente'
    }));
    
    return res.status(200).json(validatedUsers);
    
  } catch (error) {
    console.error('Erreur dans getUsers:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    console.log('=== FIN getUsers ===');
  }
};

// Mettre à jour le statut d'un utilisateur
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID utilisateur manquant" });
    }

    if (!status || !['en-attente', 'approuvé', 'non-approuvé'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    // Vérifier que l'utilisateur existe et n'est pas un super_admin
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (userToUpdate.role === 'super_admin') {
      return res.status(403).json({ message: "Action non autorisée sur un super administrateur" });
    }

    // Mettre à jour le statut
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
    }

    res.status(200).json({ 
      success: true,
      message: "Statut mis à jour avec succès", 
      user 
    });
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la mise à jour du statut", 
      error: error.message 
    });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Ne pas permettre la suppression d'un super_admin
    if (user.role === 'super_admin') {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur", error: error.message });
  }
};