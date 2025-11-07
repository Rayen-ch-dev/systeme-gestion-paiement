import mongoose from 'mongoose';

// Configuration de la connexion MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/gestion-paiement';

async function checkUsers() {
  try {
    // Se connecter à la base de données
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à la base de données');
    
    // Récupérer les utilisateurs avec les rôles formateur ou coordinateur
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      status: String
    }));
    
    const users = await User.find({ role: { $in: ['formateur', 'coordinateur'] } });
    
    console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
    
    // Afficher les informations des utilisateurs
    users.forEach(user => {
      console.log({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'non défini'
      });
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification des utilisateurs:', error);
  } finally {
    // Se déconnecter de la base de données
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUsers();
