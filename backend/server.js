import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import comptableRoutes from "./routes/comptableRoutes.js";
import ResetPasswordRoutes from "./routes/ResetPasswordRoutes.js";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des chemins ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware pour le logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Connexion à la base de données
connectDB();

// Route racine
app.get("/", (req, res) => {
  res.send("MongoDB connected to backend successfully!");
});

// Définition des routes API
app.use("/api/users", userRoutes);
app.use("/api/comptables", comptableRoutes); // Corrigé de '/api/comptable' à '/api/comptables'
app.use("/api/password/resetPassword", ResetPasswordRoutes);

// Gestion des routes non trouvées (doit être avant le gestionnaire d'erreurs)
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur serveur',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Configuration du port
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Fermer le serveur et quitter le processus
  server.close(() => process.exit(1));
});