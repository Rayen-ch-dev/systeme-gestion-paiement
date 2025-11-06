import express from "express";
import { 
  createUser, 
  DeleteUser, 
  getCurrentUser, 
  getUser, 
  loginUser, 
  UpdateUser, 
  updateProfile 
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.put("/updateUser/:id", UpdateUser);
router.delete("/deleteUser/:id", DeleteUser);
router.get("/getUserById/:id", getUser);
router.get("/me", protect, getCurrentUser);
router.put("/update-profile", protect, updateProfile);



export default router;
