import express from "express";
import {SendForgotPasswordLink,VerifyResetPasswordToken,ResetPassword} from "../controllers/RestPasswordController.js"

const ResetPasswordRoutes = express.Router();
ResetPasswordRoutes.post("/getForgotPasswordLink",SendForgotPasswordLink);
ResetPasswordRoutes.get("/verifyToken/:id/:token",VerifyResetPasswordToken);
ResetPasswordRoutes.post("/resetPassword/:id/:token",ResetPassword);


export default ResetPasswordRoutes;