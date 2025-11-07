import { Comptable } from "../models/Comptable.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';

/**
 * Helper pour gérer les erreurs de validation Mongoose
 * @param {Error} error - L'erreur de validation
 * @param {Object} res - L'objet réponse Express
 * @returns {Object|undefined} La réponse d'erreur ou undefined si ce n'est pas une erreur de validation
 */
const handleValidationError = (error, res) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: messages
    });
  }
  return null;
};

/**
 * Helper pour gérer les erreurs de doublon
 * @param {Error} error - L'erreur de doublon
 * @param {Object} res - L'objet réponse Express
 * @returns {Object|undefined} La réponse d'erreur ou undefined si ce n'est pas une erreur de doublon
 */
const handleDuplicateKeyError = (error, res) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = field === 'email' 
      ? 'Un compte avec cet email existe déjà' 
      : field === 'cin' 
        ? 'Ce numéro CIN est déjà utilisé'
        : `La valeur du champ '${field}' est déjà utilisée`;
    
    return res.status(400).json({
      success: false,
      message,
      field
    });
  }
  return null;
};

/**
 * Enregistre un nouveau comptable
 * @route POST /api/comptables/register
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const registerComptable = async (req, res) => {
  try {
    const { name, lastname, cin, email, password, role = 'comptable' } = req.body;
    
    // Journalisation des données reçues (sans le mot de passe pour des raisons de sécurité)
    console.log('Tentative de création de comptable avec les données:', { 
      name, 
      lastname, 
      cin: cin ? '***' + cin.slice(-4) : 'non fourni',
      email: email ? '***' + email.split('@')[0].slice(-3) + '@' + email.split('@')[1] : 'non fourni',
      role
    });

    // Vérifier les permissions de l'utilisateur
    if (req.user.role !== 'super_admin' && role !== 'comptable') {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à créer un compte avec ce rôle"
      });
    }

    // Vérifier que tous les champs requis sont présents
    if (!name || !lastname || !cin || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires'
      });
    }

    // Création du nouveau comptable
    const newComptable = new Comptable({
      name: name.trim(),
      lastname: lastname.trim(),
      cin: cin.trim().toUpperCase(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role || 'comptable',
      status: 'actif'
    });

    // Sauvegarder le nouveau comptable
    const savedComptable = await newComptable.save();
    
    if (!savedComptable) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la création du compte"
      });
    }
    
    // Générer le token JWT
    const token = savedComptable.generateAuthToken();
    
    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...comptableWithoutPassword } = savedComptable.toObject();

    console.log('Comptable créé avec succès:', { 
      id: savedComptable._id, 
      email: savedComptable.email,
      role: savedComptable.role 
    });
    
    res.status(201).json({ 
      success: true,
      message: "Comptable créé avec succès",
      token,
      comptable: comptableWithoutPassword 
    });
  } catch (error) {
    console.error('Erreur lors de la création du comptable:', error);
    
    // Gérer les erreurs de validation
    const validationError = handleValidationError(error, res);
    if (validationError) return validationError;
    
    // Gérer les erreurs de doublon
    const duplicateError = handleDuplicateKeyError(error, res);
    if (duplicateError) return duplicateError;
    
    // Erreur serveur générique
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur lors de la création du compte",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Authentifie un comptable
 * @route POST /api/comptables/login
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const loginComptable = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier que l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir un email et un mot de passe"
      });
    }

    // Trouver l'utilisateur par email (en incluant le mot de passe hashé)
    const user = await Comptable.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .select('+status');

    // Vérifier si l'utilisateur existe
    if (!user) {
      // Ne pas révéler que l'email n'existe pas pour des raisons de sécurité
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    // Vérifier si le compte est actif
    if (user.status !== 'actif') {
      return res.status(403).json({
        success: false,
        message: "Votre compte n'est pas actif. Veuillez contacter l'administrateur."
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Enregistrer la tentative de connexion échouée (à implémenter si nécessaire)
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Générer le token JWT
    const token = user.generateAuthToken();

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: userPassword, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la connexion du comptable:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère la liste des comptables avec pagination et filtrage
 * @route GET /api/comptables
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getAllComptables = async (req, res) => {
  try {
    // Récupération des paramètres de requête
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Construction de la requête de filtrage
    const query = {};
    
    // Filtre par recherche (nom, prénom, email)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { lastname: searchRegex },
        { email: searchRegex }
      ];
    }
    
    // Filtre par statut
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Tri
    const sort = {};
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    sort[sortBy] = order;
    
    // Exécution des requêtes en parallèle
    const [comptables, total] = await Promise.all([
      Comptable.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Comptable.countDocuments(query)
    ]);
    
    // Calcul des métadonnées de pagination
    const pages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      count: comptables.length,
      page,
      pages,
      total,
      data: comptables
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des comptables:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des comptables',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère un comptable par son ID
 * @route GET /api/comptables/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getComptableById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de comptable invalide'
      });
    }
    
    // Récupérer le comptable sans le mot de passe
    const comptable = await Comptable.findById(id).select('-password');
    
    if (!comptable) {
      return res.status(404).json({
        success: false,
        message: 'Comptable non trouvé'
      });
    }
    
    // Vérifier les permissions (seul un admin/super_admin peut voir les détails d'un autre utilisateur)
    if (req.user.role !== 'super_admin' && 
        req.user.role !== 'admin' && 
        req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à accéder à ces informations'
      });
    }
    
    res.status(200).json({
      success: true,
      data: comptable
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du comptable:', error);
    
    // Gérer les erreurs de cast
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Format d\'ID invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du comptable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Met à jour un comptable existant
 * @route PUT /api/comptables/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const updateComptable = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Journalisation
    console.log('Tentative de mise à jour du comptable:', { 
      id, 
      updates: { ...updates, password: updates.password ? '***' : 'non modifié' },
      requestedBy: req.user.id 
    });
    
    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de comptable invalide'
      });
    }

    // Vérifier que le comptable existe
    const comptable = await Comptable.findById(id);
    if (!comptable) {
      return res.status(404).json({
        success: false,
        message: 'Comptable non trouvé'
      });
    }
    
    // Vérifier les permissions
    // Un utilisateur ne peut modifier que son propre compte, sauf s'il est admin ou super_admin
    const isSelfUpdate = req.user.id === id;
    const isUpdatingComptable = comptable.role === 'comptable';
    
    if (!isSelfUpdate && req.user.role === 'comptable') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier un autre compte'
      });
    }
    
    // Seul un super_admin peut modifier un autre admin ou super_admin
    if ((comptable.role === 'admin' || comptable.role === 'super_admin') && 
        req.user.role !== 'super_admin' && 
        !isSelfUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Seul un super administrateur peut modifier un administrateur ou un autre super administrateur'
      });
    }
    
    // Mettre à jour le mot de passe si fourni
    if (updates.password) {
      if (updates.password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 8 caractères'
        });
      }
      // Hacher le mot de passe avant de le sauvegarder
      const salt = await bcrypt.genSalt(10);
      comptable.password = await bcrypt.hash(updates.password, salt);
      delete updates.password; // Pour éviter de le réécrire plus bas
    }
    
    // Mettre à jour les autres champs
    const allowedUpdates = ['name', 'lastname', 'cin', 'email', 'status', 'role'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        // Vérification spéciale pour le rôle
        if (field === 'role' && req.user.role !== 'super_admin') {
          return; // Ignorer la mise à jour du rôle si pas super_admin
        }
        
        if (field === 'email') {
          updateData[field] = updates[field].toLowerCase().trim();
        } else if (field === 'cin') {
          updateData[field] = updates[field].trim().toUpperCase();
        } else if (field === 'name' || field === 'lastname') {
          updateData[field] = updates[field].trim();
        } else {
          updateData[field] = updates[field];
        }
      }
    });
    
    // Mettre à jour le document
    const updatedComptable = await Comptable.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedComptable) {
      return res.status(404).json({
        success: false,
        message: 'Comptable non trouvé après la mise à jour'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Comptable mis à jour avec succès',
      data: updatedComptable
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du comptable:', error);
    
    // Gérer les erreurs de validation
    const validationError = handleValidationError(error, res);
    if (validationError) return validationError;
    
    // Gérer les erreurs de doublon
    const duplicateError = handleDuplicateKeyError(error, res);
    if (duplicateError) return duplicateError;
    
    // Gérer les erreurs de cast
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Format d\'ID invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du comptable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await session.endSession().catch(console.error);
  }
};

/**
 * Supprime un comptable
 * @route DELETE /api/comptables/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const deleteComptable = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    // Journalisation
    console.log('Tentative de suppression du comptable:', { 
      id, 
      requestedBy: req.user.id 
    });
    
    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'ID de comptable invalide'
      });
    }
    
    // Vérifier que le comptable existe
    const comptable = await Comptable.findById(id).session(session);
    if (!comptable) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Comptable non trouvé'
      });
    }
    
    // Vérifier les permissions
    // Un utilisateur ne peut pas se supprimer lui-même
    if (req.user.id === id) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }
    
    // Seul un super_admin peut supprimer un autre admin ou super_admin
    const isDeletingAdmin = ['admin', 'super_admin'].includes(comptable.role);
    if (isDeletingAdmin && req.user.role !== 'super_admin') {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Seul un super administrateur peut supprimer un administrateur ou un autre super administrateur'
      });
    }
    
    // Empêcher la suppression d'un super_admin par un non super_admin
    if (comptable.role === 'super_admin' && req.user.role !== 'super_admin') {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer un super administrateur'
      });
    }
    
    // Vérifier s'il reste au moins un super_admin actif
    if (comptable.role === 'super_admin') {
      const superAdminCount = await Comptable.countDocuments({ 
        role: 'super_admin',
        _id: { $ne: id },
        status: 'actif'
      }).session(session);
      
      if (superAdminCount === 0) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier super administrateur actif'
        });
      }
    }
    
    // Supprimer le comptable
    await Comptable.findByIdAndDelete(id).session(session);
    await session.commitTransaction();
    
    console.log('Comptable supprimé avec succès:', { 
      id, 
      email: comptable.email,
      deletedBy: req.user.id 
    });
    
    res.status(200).json({
      success: true,
      message: 'Comptable supprimé avec succès',
      data: {
        id: comptable._id,
        email: comptable.email,
        role: comptable.role
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Erreur lors de la suppression du comptable:', error);
    
    // Gérer les erreurs de cast
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Format d\'ID invalide'
      });
    }
    
    // Gérer les erreurs de validation
    const validationError = handleValidationError(error, res);
    if (validationError) return validationError;
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du comptable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await session.endSession().catch(console.error);
  }
};

// Gestion des utilisateurs par le comptable

/**
 * Récupère tous les utilisateurs avec filtrage par statut
 * @route GET /api/comptables/users
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getUsers = async (req, res) => {
  try {
    console.log('Requête reçue pour récupérer les utilisateurs avec les paramètres:', req.query);
    
    const { status } = req.query;
    const query = {};
    
    // Filtrer par statut si fourni
    if (status) {
      // Normaliser le statut pour gérer les variations de casse et d'accents
      const normalizedStatus = status.toLowerCase();
      
      // Mapper les statuts pour gérer les variations
      const statusMap = {
        'en-attente': 'en-attente',
        'en attente': 'en-attente',
        'attente': 'en-attente',
        'approuve': 'approuvé',
        'approuvé': 'approuvé',
        'valide': 'approuvé',
        'non-approuve': 'non-approuvé',
        'non approuve': 'non-approuvé',
        'non-approuvé': 'non-approuvé',
        'rejete': 'non-approuvé',
        'rejeté': 'non-approuvé'
      };
      
      query.status = statusMap[normalizedStatus] || status;
      console.log('Statut normalisé pour la requête:', query.status);
    }
    
    // Récupérer les utilisateurs avec pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    console.log('Exécution de la requête avec les paramètres:', { query, skip, limit });
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);
    
    const pages = Math.ceil(total / limit);
    
    console.log(`Résultats: ${users.length} utilisateurs trouvés sur ${total}`);
    
    res.status(200).json({
      success: true,
      count: users.length,
      page,
      pages,
      total,
      data: users
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    
    // Gestion des erreurs spécifiques
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Format de paramètre invalide',
        field: error.path,
        value: error.value
      });
    }
    
    // Réponse d'erreur générique
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

/**
 * Met à jour le statut d'un utilisateur
 * @route PUT /api/comptables/users/:id/status
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const updateUserStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Vérifier que le statut est valide
    const validStatuses = ['actif', 'inactif', 'en_attente'];
    if (!status || !validStatuses.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Statut invalide. Les valeurs autorisées sont: ' + validStatuses.join(', ')
      });
    }
    
    // Vérifier que l'utilisateur existe
    const user = await User.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Mettre à jour le statut
    user.status = status;
    await user.save({ session });
    await session.commitTransaction();
    
    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = user.toObject();
    
    res.status(200).json({
      success: true,
      message: 'Statut utilisateur mis à jour avec succès',
      data: userWithoutPassword
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Erreur lors de la mise à jour du statut utilisateur:', error);
    
    // Gérer les erreurs de validation
    const validationError = handleValidationError(error, res);
    if (validationError) return validationError;
    
    // Gérer les erreurs de cast
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Format d\'ID invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await session.endSession().catch(console.error);
  }
};

/**
 * Supprime un utilisateur
 * @route DELETE /api/comptables/users/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur existe
    const user = await User.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id).session(session);
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      data: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    
    // Gérer les erreurs de cast
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Format d\'ID invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await session.endSession().catch(console.error);
  }
};
