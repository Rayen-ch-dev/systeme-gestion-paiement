import express from "express";
import {SendForgotPasswordLink,ResetPassword} from "../controllers/RestPasswordController.js"

const ResetPasswordRoutes = express.Router();
ResetPasswordRoutes.post("/getForgotPasswordLink",SendForgotPasswordLink);
ResetPasswordRoutes.post("/:type/:id/:token",ResetPassword);


export default ResetPasswordRoutes;