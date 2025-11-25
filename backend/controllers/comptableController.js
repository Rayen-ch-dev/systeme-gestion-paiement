import { Comptable } from "../models/Comptable.js";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const registerComptable = async (req, res) => {
  try {
    const { name, lastname, cin, email, password } = req.body;

    // Check if user already exists
    const existing = await Comptable.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new comptable with mustChangePassword = true
    const newComptable = new Comptable({
      name,
      lastname,
      cin,
      email,
      password,
      mustChangePassword: true, // force password change on first login
    });
    await newComptable.save();

    res.status(201).json({ message: "Comptable created successfully", comptable: newComptable });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginComptable = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find comptable by email
    const user = await Comptable.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Email or password invalid" });
    }

    // Generate JWT including mustChangePassword in payload
    const token = jwt.sign(
      {
        id: user._id,
        mustChangePassword: user.mustChangePassword, // <-- include this
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        cin: user.cin,
        email: user.email,
        mustChangePassword: user.mustChangePassword, // send this also separately for frontend convenience
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// get all  comptable
export const getAllComptables = async (req, res) => {
  try {
    const comptables = await Comptable.find();
    res.status(200).json(comptables);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get comptable by id
export const getComptableById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ ok: false, message: "ID is required" });
    }

    const comptable = await Comptable.findById(id);

    if (!comptable) {
      return res.status(404).json({ ok: false, message: "Comptable not found" });
    }

    return res.status(200).json({
      ok: true,
      user: comptable, // important: on envoie dans une clé 'user'
    });
  } catch (error) {
    console.error(" Erreur getComptableById:", error.message);
    return res.status(500).json({
      ok: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// UPDATE comptable
export const updateComptable = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lastname, cin, email, password } = req.body;

    const updateData = { name, lastname, cin, email };

    if (password) {
      // Hash the password before updating
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Use findByIdAndUpdate to avoid triggering the pre-save hook (which would double-hash)
    const updated = await Comptable.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Comptable not found" });

    res.status(200).json({
      message: "Comptable updated successfully",
      comptable: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE comptable
export const deleteComptable = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Comptable.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Comptable not found" });

    res.status(200).json({ message: "Comptable deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}; 

// Validate user (accept/reject)
export const validateUser = async (req, res) => {
  try {
    // Vérifie que le body est reçu
    console.log("REQ.BODY:", req.body);

    const { status } = req.body; // accepted ou rejected
    if (!['approuvé', 'non-approuvé'].includes(status)) {
      return res.status(400).json({ message: 'Status invalide' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ message: `Utilisateur ${status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//change password compatble
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // From authenticateToken middleware
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Le mot de passe est trop court." });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Use findByIdAndUpdate to avoid triggering the pre-save hook (which would double-hash)
    const user = await Comptable.findByIdAndUpdate(
      userId,
      { 
        password: hashedPassword,
        mustChangePassword: false
      },
      { new: true } // Return updated document
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Generate a new token with mustChangePassword: false
    const token = jwt.sign(
      { id: user._id, mustChangePassword: false, role: "comptable" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Mot de passe changé avec succès.", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
