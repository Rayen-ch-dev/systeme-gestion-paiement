import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Comptable } from "../models/Comptable.js";
import nodemailer from "nodemailer";

// send email link to reset password
//request Post
// api :http://localhost:3000/api/password/resetPassword/getForgotPasswordLink
export const SendForgotPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;

    let account = await User.findOne({ email });
    let accountType = "user";

    if (!account) {
      account = await Comptable.findOne({ email });
      accountType = "comptable";
    }

    if (!account) {
      return res.status(404).json({ message: "Email not found" });
    }

    const secret = process.env.JWT_SECRET + account.password;
    const token = jwt.sign({ email: account.email, id: account._id, type: accountType }, secret, {
      expiresIn: "10m",
    });
    console.log("Verifying token:", token);

const link = `http://localhost:5173/reset-password?type=${accountType}&id=${account._id}&token=${token}`;

const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

const mailOptions = { 
  from: `"Équipe d'assistance" <${process.env.EMAIL_USER}>`, 
  to: account.email, 
  subject: "Réinitialisation de votre mot de passe", 
  html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #2563eb; color: #ffffff; padding: 16px 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px;">Demande de réinitialisation du mot de passe</h2>
        </div>
        <div style="padding: 24px; color: #333333; line-height: 1.6;">
          <p>Bonjour <strong>${account.name || "utilisateur"}</strong>,</p>
          <p>Nous avons reçu une demande de réinitialisation de votre mot de passe.  
          Si vous êtes à l’origine de cette demande, veuillez cliquer sur le bouton ci-dessous pour créer un nouveau mot de passe.</p>

          <div style="text-align: center; margin: 30px 0;">  
          <a href="${link}" 
              style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-weight: bold;"
              target="_blank">
              Réinitialiser mon mot de passe
            </a>
          </div>

          <p>⚠️ Ce lien expirera dans <strong>10 minutes</strong>.</p>
          <p>Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail. Votre compte restera sécurisé.</p>

          <p style="margin-top: 32px;">Cordialement,<br><strong>L’équipe d’assistance</strong></p>
        </div>
        <div style="background-color: #f4f4f7; text-align: center; padding: 12px; font-size: 12px; color: #999;">
          © ${new Date().getFullYear()} Votre entreprise. Tous droits réservés.
        </div>
      </div>
    </div>
  `,
};



    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//  Reset password
//request Post
//api: http://localhost:3000/api/password/resetPassword/ResetPassword/:type/:id/:token
export const ResetPassword = async (req, res) => {
  const { id, token, type } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }


    const Model = type === "comptable" ? Comptable : User;
    const account = await Model.findById(id);

    if (!account) {
      return res.status(404).json({ message: `${type} not found` });
    }

    const secret = process.env.JWT_SECRET + account.password;
    jwt.verify(token.trim(), secret);

    const hashedPassword = await bcrypt.hash(password, 10);
    await Model.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

    res.status(200).json({ message: `${type} password reset successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};
