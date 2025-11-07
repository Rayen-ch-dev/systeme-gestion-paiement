import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const comptableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom est requis"],
    trim: true,
    minlength: [2, "Le nom doit contenir au moins 2 caractères"],
    maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"]
  },
  lastname: {
    type: String,
    required: [true, "Le prénom est requis"],
    trim: true,
    minlength: [2, "Le prénom doit contenir au moins 2 caractères"],
    maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"]
  },
  cin: {
    type: String,
    required: [true, "Le CIN est requis"],
    trim: true,
    unique: true,
    uppercase: true,
    match: [/^[0-9]{8}$/, "Le CIN doit être composé de 8 chiffres"]
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Veuillez entrer un email valide"]
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est requis"],
    minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
    select: false // Ne pas retourner le mot de passe dans les requêtes
  },
  role: {
    type: String,
    default: "comptable",
    enum: {
      values: ["comptable", "admin", "super_admin"],
      message: "Rôle non valide"
    }
  },
  status: {
    type: String,
    enum: {
      values: ["actif", "inactif", "en_attente"],
      default: "actif",
      message: "Statut non valide"
    }
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances des recherches fréquentes
comptableSchema.index({ email: 1 });
comptableSchema.index({ cin: 1 });

// Middleware pour hacher le mot de passe avant la sauvegarde
comptableSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
comptableSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un token JWT
comptableSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

export const Comptable = mongoose.model("Comptable", comptableSchema);
