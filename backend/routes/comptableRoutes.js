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
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes d'authentification (publiques)
router.post("/register", registerComptable);
router.post("/login", loginComptable);

// Middleware d'authentification pour les routes protégées
router.use(protect);
router.use(authorize('comptable'));

// Gestion des comptables
router.get("/", getAllComptables);
router.get("/:id", getComptableById);
router.put("/:id", updateComptable);
router.delete("/:id", deleteComptable);

// Gestion des utilisateurs (formateurs et coordinateurs)
router.get("/users", getUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

export default router;
