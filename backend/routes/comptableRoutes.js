import express from "express";
import { 
  registerComptable, 
  loginComptable, 
  getAllComptables, 
  getComptableById, 
  updateComptable, 
  deleteComptable,
  getUsers,
  updateUserStatus,
  deleteUser
} from "../controllers/comptableController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/comptables/login
 * @desc    Authentification d'un comptable
 * @access  Public
 */
router.post("/login", loginComptable);

// Appliquer la protection JWT à toutes les routes suivantes
router.use(protect);

/**
 * Middleware pour vérifier les droits d'administration
 * Autorise uniquement les rôles 'admin' et 'super_admin'
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role === 'super_admin' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Accès réservé aux administrateurs' 
  });
};

/**
 * Middleware pour vérifier les droits de super administrateur
 * Autorise uniquement le rôle 'super_admin'
 */
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Accès réservé aux super administrateurs' 
  });
};

/**
 * Middleware pour vérifier les droits de gestion des utilisateurs
 * Autorise les rôles 'super_admin' et 'comptable'
 */
const canManageUsers = (req, res, next) => {
  console.log('Vérification des droits pour le rôle:', req.user.role);
  if (['super_admin', 'comptable'].includes(req.user.role)) {
    return next();
  }
  console.log('Accès refusé pour le rôle:', req.user.role);
  return res.status(403).json({ 
    success: false, 
    message: 'Droits insuffisants pour accéder à cette ressource' 
  });
};

/**
 * Middleware pour vérifier si l'utilisateur est le propriétaire ou un administrateur
 * Utilisé pour les opérations sur un comptable spécifique
 */
const isOwnerOrAdmin = (req, res, next) => {
  if (req.user.id === req.params.id || 
      req.user.role === 'admin' || 
      req.user.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Accès non autorisé à cette ressource' 
  });
};

// ==================== ROUTES DES COMPTABLES ====================

/**
 * @route   POST /api/comptables/register
 * @desc    Créer un nouveau comptable (admin/super_admin)
 * @access  Privé (admin/super_admin)
 */
router.post("/register", requireAdmin, registerComptable);

/**
 * @route   POST /api/comptables
 * @desc    Créer un nouveau comptable (admin/super_admin) - Ancienne route conservée pour compatibilité
 * @access  Privé (admin/super_admin)
 */
router.post("/", requireAdmin, registerComptable);

/**
 * @route   GET /api/comptables
 * @desc    Récupérer tous les comptables
 * @access  Privé (super_admin/comptable)
 */
router.get("/", canManageUsers, getAllComptables);

/**
 * @route   GET /api/comptables/:id
 * @desc    Récupérer un comptable par son ID
 * @access  Privé (propriétaire/admin/super_admin)
 */
router.get("/:id", isOwnerOrAdmin, getComptableById);

/**
 * @route   PUT /api/comptables/:id
 * @desc    Mettre à jour un comptable
 * @access  Privé (propriétaire/admin/super_admin)
 */
router.put("/:id", isOwnerOrAdmin, updateComptable);

/**
 * @route   DELETE /api/comptables/:id
 * @desc    Supprimer un comptable
 * @access  Privé (admin/super_admin)
 */
router.delete("/:id", requireAdmin, deleteComptable);

// ==================== ROUTES DE GESTION DES UTILISATEURS ====================

/**
 * @route   GET /api/comptables/users
 * @desc    Récupérer tous les utilisateurs (avec filtres)
 * @access  Privé (super_admin/comptable)
 */
router.get("/users", canManageUsers, getUsers);

/**
 * @route   PUT /api/comptables/users/:id/status
 * @desc    Mettre à jour le statut d'un utilisateur
 * @access  Privé (admin/super_admin)
 */
router.put("/users/:id/status", requireAdmin, updateUserStatus);

/**
 * @route   DELETE /api/comptables/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Privé (admin/super_admin)
 */
router.delete("/users/:id", requireAdmin, deleteUser);

export default router;
