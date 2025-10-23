import express from "express";
import { registerComptable, loginComptable } from "../controllers/comptableController.js";

const router = express.Router();

router.post("/register", registerComptable);
router.post("/login", loginComptable);

export default router;
