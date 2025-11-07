import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Vérifier que les modèles sont bien chargés
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections disponibles:', collections.map(c => c.name));
    
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('Vérifiez que le serveur MongoDB est en cours d\'exécution et que l\'URI est correcte');
    process.exit(1);
  }
};

// Gestion des erreurs après la connexion initiale
mongoose.connection.on('error', err => {
  console.error('Erreur de connexion MongoDB après connexion initiale:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Déconnecté de MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('Reconnecté à MongoDB');
});
