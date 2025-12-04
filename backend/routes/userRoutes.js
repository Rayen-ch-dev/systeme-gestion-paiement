import express from "express";
import { 
  createUser, 
  DeleteUser, 
  getUser, 
  loginUser, 
  UpdateUser, 
  getAllUsers,
  updateProfile // AJOUTEZ CETTE IMPORT
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.put("/updateUser/:id", UpdateUser);
router.put("/updateProfile", updateProfile); // AJOUTEZ CETTE ROUTE
router.delete("/deleteUser/:id", DeleteUser);
router.get("/getUserById/:id", getUser);
router.get("/getUsers", getAllUsers);

export default router;