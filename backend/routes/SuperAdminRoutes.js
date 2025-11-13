import express from "express";
import { loginSuperAdmin, registerSuperAdmin} from "../controllers/SuperAdminController.js";

const router = express.Router();

router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);


export default router;