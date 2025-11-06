import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

// Middleware pour vérifier le token JWT
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};

// Middleware pour protéger les routes et vérifier l'authentification
export const protect = async (req, res, next) => {
  try {
    console.log('=== MIDDLEWARE PROTECT ===');
    console.log('URL de la requête:', req.originalUrl);
    console.log('Méthode HTTP:', req.method);
    console.log('Headers reçus:', req.headers);
    console.log('Cookies reçus:', req.cookies);
    
    let token;
    
    // Vérifier si le token est présent dans le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extrait du header Authorization');
      console.log('Valeur du token:', token ? '***' + token.slice(-8) : 'Aucun token');
    } else if (req.cookies?.token) {
      token = req.cookies.token;
      console.log('Token extrait des cookies');
      console.log('Valeur du token:', token ? '***' + token.slice(-8) : 'Aucun token');
    } else {
      console.log('Aucun token trouvé ni dans les headers ni dans les cookies');
    }

    // Vérifier si le token existe
    if (!token) {
      console.error('Aucun token trouvé dans la requête');
      return res.status(401).json({ 
        success: false,
        message: 'Non autorisé - Aucun token fourni' 
      });
    }

    try {
      console.log('Vérification du token...');
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token décodé:', decoded);
      
      if (!decoded.id) {
        console.error('Token invalide: ID manquant');
        return res.status(401).json({
          success: false,
          message: 'Token invalide - ID manquant'
        });
      }
      
      // Récupérer l'utilisateur à partir de l'ID dans le token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.error('Utilisateur non trouvé pour le token fourni');
        return res.status(401).json({ 
          success: false,
          message: 'Non autorisé - Utilisateur introuvable' 
        });
      }
      
      console.log('Utilisateur authentifié:', { id: user._id, role: user.role });
      
      // Ajouter l'utilisateur à l'objet de requête
      req.user = user;
      next();
      
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Non autorisé - Token invalide' 
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Session expirée - Veuillez vous reconnecter' 
        });
      }
      
      res.status(401).json({ 
        message: 'Non autorisé - Échec de l\'authentification' 
      });
    }
  } catch (error) {
    console.error('Erreur dans le middleware protect:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'authentification' 
    });
  }
};

// Middleware pour vérifier les rôles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource` 
      });
    }
    next();
  };
};
