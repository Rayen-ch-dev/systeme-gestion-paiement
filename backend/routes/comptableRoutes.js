import express from "express";
import { registerComptable, loginComptable, getAllComptables, getComptableById, updateComptable, deleteComptable } from "../controllers/comptableController.js";

const router = express.Router();

router.post("/register", registerComptable);
router.post("/login", loginComptable);
router.get("/", getAllComptables);
router.get("getComptableById/:id", getComptableById);
router.put("updateComptable/:id", updateComptable);
router.delete("deleteComptable/:id", deleteComptable);

export default router;
