import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    const { name, lastname, cin, email, password, role, banque, rib, specialite, fonction } = req.body;

    // Basic required fields
    if (!name || !lastname || !cin || !email || !password || !rib || !banque || !role) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // Check role-specific required fields
    if (role === 'formateur' && !specialite) {
      return res.status(400).json({ message: "Le champ spécialité est obligatoire pour les formateurs" });
    }
    
    if (role === 'coordinateur' && !fonction) {
      return res.status(400).json({ message: "Le champ fonction est obligatoire pour les coordinateurs" });
    }

    const newUser = new User({ 
      name, 
      lastname, 
      cin, 
      email, 
      password, 
      role, 
      banque, 
      rib, 
      specialite, 
      fonction 
    });
    
    await newUser.save();

    res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email ou RIB déjà utilisé" });
    }
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    // Mettre à jour le statut si nécessaire
    if (!user.status) {
      // Les super_admins et les comptables sont automatiquement approuvés
      if (user.role === 'super_admin' || user.role === 'comptable') {
        user.status = 'approuvé';
      } else {
        user.status = 'en-attente';
      }
    }
    
    // Vérifier si l'utilisateur est approuvé
    if (user.status !== 'approuvé' && user.role !== 'super_admin') {
      return res.status(403).json({ 
        message: "Votre compte n'est pas encore approuvé par l'administrateur" 
      });
    }
    
    // Sauvegarder les modifications
    await user.save();
    
    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    // Préparer la réponse avec toutes les informations utilisateur
    const userResponse = {
      id: user._id,
      name: user.name,
      lastname: user.lastname,
      cin: user.cin,
      email: user.email,
      role: user.role,
      status: user.status,
      specialite: user.specialite,
      fonction: user.fonction,
      banque: user.banque,
      rib: user.rib,
      createdAt: user.createdAt
    };
    
    // Si l'utilisateur est un comptable, on peut ajouter des champs spécifiques si nécessaire
    if (user.role === 'comptable') {
      // Ajouter des champs spécifiques aux comptables si nécessaire
      userResponse.isComptable = true;
    }
    
    const response = {
      message: "Connexion réussie",
      token,
      user: userResponse
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      message: "Une erreur est survenue lors de la connexion", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
//delete user
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
    res.status(500).json({ message: "Erreur serveur", error: error.message  });

}};
//Update User
export const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialite, fonction, ...otherData } = req.body;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Prevent update if status is "en-attente"
    if (existingUser.status === "en-attente") {
      return res.status(400).json({
        message: "Impossible de mettre à jour un utilisateur en attente de validation",
      });
    }

    // Prepare update data
    const updateData = { ...otherData };
    
    // Only update specialite for formateurs
    if (existingUser.role === 'formateur' && specialite !== undefined) {
      updateData.specialite = specialite;
    }
    
    // Only update fonction for coordinateurs
    if (existingUser.role === 'coordinateur' && fonction !== undefined) {
      updateData.fonction = fonction;
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message  });

    
  }

}
//get user by id
export const getUser=async(req,res)=>{
  try {
    const {id}=req.params;
    const user=await User.findById(id);
    if(!user){
      res.status(404).json({
        message:"User Not Found"
      })
    }
    res.status(200).json({
      user,
    })

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    // req.user est défini par le middleware d'authentification
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération du profil utilisateur",
      error: error.message 
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, lastname, email, cin, specialite, fonction, banque, rib, password, newPassword } = req.body;
    const userId = req.user.id; // ID de l'utilisateur connecté
    
    // Vérifier que l'utilisateur existe
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Vérifier si l'utilisateur souhaite changer son mot de passe
    if (newPassword && newPassword.trim() !== '') {
      // Si un nouveau mot de passe est fourni, on le hache et on le sauvegarde
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    // Si pas de nouveau mot de passe, le mot de passe actuel est conservé automatiquement
    
    // Mettre à jour les champs autorisés
    if (name) user.name = name;
    if (lastname) user.lastname = lastname;
    if (email) user.email = email;
    if (cin) user.cin = cin;
    
    // Mise à jour des champs spécifiques au rôle
    if (user.role === 'formateur' && specialite !== undefined) {
      user.specialite = specialite;
    }
    
    if (user.role === 'coordinateur' && fonction !== undefined) {
      user.fonction = fonction;
    }
    
    // Mise à jour des informations bancaires
    if (banque) user.banque = banque;
    if (rib) user.rib = rib;
    
    // Sauvegarder les modifications
    const updatedUser = await user.save();
    
    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = updatedUser.toObject();
    
    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Cette adresse email est déjà utilisée" });
    }
    res.status(500).json({ 
      message: "Erreur lors de la mise à jour du profil",
      error: error.message 
    });
  }
};
