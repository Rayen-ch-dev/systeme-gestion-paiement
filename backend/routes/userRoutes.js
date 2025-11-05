import express from "express";
import { createUser, DeleteUser, getUser, loginUser, UpdateUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.put("/updateUser/:id",UpdateUser);
router.delete("/deleteUser/:id",DeleteUser);
router.get("/getUserById/:id",getUser);



export default router;
