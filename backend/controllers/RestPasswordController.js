import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import nodemailer from "nodemailer";

// send email link to reset password
//request Post
// api :http://localhost:3000/api/password/resetPassword/getForgotPasswordLink
export const SendForgotPasswordLink = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Email not found. Please verify your input.",
      });
    }

    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign({ email: user.email, id: user._id }, secret, {
      expiresIn: "10m",
    });

    const link = `http://localhost:5173/reset-password/${user._id}/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h3>Hello ${user.name || "user"},</h3>
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password (valid for 10 minutes):</p>
        <a href="${link}" target="_blank">${link}</a>
      `,
    };

    // Send the email using await
    await transporter.sendMail(mailOptions);

    // Respond with success message
    res.status(200).json({ message: "Password reset email sent successfully. please check your email" });

  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Verify token
//request Get
//api: http://localhost:3000/api/password/resetPassword/verifyToken/:id/:token
export const VerifyResetPasswordToken = async (req, res) => {
  try {
    const { id, token } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = process.env.JWT_SECRET + user.password;
    jwt.verify(token, secret);

    res.status(200).json({ message: "Token valid" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token", error: error.message });
  }
};

//  Reset password
//request Post
//api: http://localhost:3000/api/password/resetPassword/ResetPassword/:id/:token
export const ResetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = process.env.JWT_SECRET + user.password;
    jwt.verify(token, secret);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error resetting password",
      error: error.message,
    });
  }
};
