import express from "express";
import { registerComptable, loginComptable, getAllComptables, getComptableById, updateComptable, deleteComptable ,validateUser,changePassword} from "../controllers/comptableController.js";
import authenticateToken from "../middleware/authenticateToken.js";
const router = express.Router();

router.post("/register", registerComptable);
router.post("/login", loginComptable);
router.get("/", getAllComptables);
router.get("/getComptableById/:id", getComptableById);
router.put("/updateComptable/:id", updateComptable);
router.delete("/deleteComptable/:id", deleteComptable);
router.put("/validateUser/:id", validateUser);
router.post("/change-password", authenticateToken, changePassword);


export default router;
