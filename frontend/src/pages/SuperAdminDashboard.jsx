import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; // Utiliser l'instance configurée d'axios
import { toast } from 'react-toastify';

// Composant de bouton avec style cohérent
const Button = ({ children, onClick, className = '', variant = 'primary', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Composant de carte
const Card = ({ children, className = '', title, icon }) => (
  <div className={`rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}>
    {title && (
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
          {icon && <span className="text-slate-500">{icon}</span>}
          {title}
        </h3>
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
)

export default function SuperAdminDashboard() {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    cin: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [comptables, setComptables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [profile, setProfile] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Vérifier le rôle de l'utilisateur et récupérer le profil
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setProfile(user);
        
        // Vérifier si l'utilisateur a le bon rôle
        if (user.role !== 'super_admin') {
          console.warn('Accès refusé : rôle non autorisé');
          // Rediriger vers la page appropriée selon le rôle
          if (user.role === 'admin' || user.role === 'comptable') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
          return;
        }
      } else {
        // Si pas d'utilisateur connecté, rediriger vers la page de connexion
        navigate('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Gérer l'ouverture/fermeture du profil
  useEffect(() => {
    const readHash = () => {
      setProfileOpen(window.location.hash === '#profile');
    };
    
    readHash();
    window.addEventListener('hashchange', readHash);
    
    const onKey = (e) => {
      if (e.key === 'Escape' && window.location.hash === '#profile') {
        window.location.hash = '';
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('hashchange', readHash);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // Gérer le défilement du corps lorsque le profil est ouvert
  useEffect(() => {
    document.body.style.overflow = profileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [profileOpen]);

  // Récupérer la liste des comptables
  const fetchComptables = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Vérifier si l'utilisateur est connecté
      if (!token) {
        console.error('Aucun token trouvé dans le localStorage');
        toast.error('Veuillez vous reconnecter');
        navigate('/login');
        return;
      }

      console.log('Récupération des comptables...');
      
      // Utiliser l'instance configurée d'api qui inclut déjà le token et les en-têtes
      const response = await api.get('/comptables');
      
      console.log('Réponse de l\'API comptables:', {
        status: response.status,
        data: response.data
      });
      
      // Vérifier que la réponse contient bien un tableau de données
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setComptables(response.data.data);
      } else {
        console.error('Format de réponse inattendu:', response.data);
        throw new Error('Format de réponse inattendu du serveur');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des comptables:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      // Gestion spécifique des erreurs
      if (error.response) {
        // Erreurs 4xx/5xx
        if (error.response.status === 403) {
          toast.error('Accès refusé. Vous n\'avez pas les droits nécessaires.');
        } else if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(`Erreur serveur (${error.response.status})`);
        }
        
        // Si le token est invalide ou expiré
        if (error.response.status === 401 || error.response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Aucune réponse du serveur:', error.request);
        toast.error('Le serveur ne répond pas. Veuillez réessayer plus tard.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration de la requête:', error.message);
        toast.error('Erreur de configuration. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComptables();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!formData.name || !formData.lastname || !formData.cin || !formData.email || !formData.password) {
      toast.error('Tous les champs sont obligatoires');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }
    
    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Début de la soumission du formulaire');
    
    if (!validateForm()) {
      console.log('Échec de la validation du formulaire');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Token récupéré:', token ? '***' + token.slice(-8) : 'non trouvé');
      
      if (!token) {
        console.error('Aucun token trouvé dans le localStorage');
        toast.error('Veuillez vous reconnecter');
        navigate('/login');
        return;
      }
      
      // Préparer les données du formulaire
      const comptableData = {
        name: formData.name.trim(),
        lastname: formData.lastname.trim(),
        cin: formData.cin.trim(),
        email: formData.email.toLowerCase().trim(),
        role: 'comptable',
        status: 'actif',
        ...(formData.password && { password: formData.password })
      };
      
      console.log('Données du formulaire préparées:', {
        ...comptableData,
        password: comptableData.password ? '***' : 'non fourni',
        editingId: editingId || 'aucun (création)'
      });
      
      let response;
      
      if (editingId) {
        // Mise à jour d'un comptable existant
        console.log(`Tentative de mise à jour du comptable avec l'ID: ${editingId}`);
        try {
          response = await api.put(
            `/comptables/${editingId}`, 
            comptableData
          );
          console.log('Réponse de la mise à jour:', {
            status: response.status,
            data: response.data
          });
          toast.success('Comptable mis à jour avec succès');
        } catch (updateError) {
          console.error('Erreur lors de la mise à jour du comptable:', {
            message: updateError.message,
            response: updateError.response?.data,
            status: updateError.response?.status
          });
          throw updateError;
        }
      } else {
        // Création d'un nouveau comptable
        console.log('Tentative de création d\'un nouveau comptable');
        if (!comptableData.password) {
          const errorMsg = 'Le mot de passe est requis pour la création';
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
        
        try {
          // Utiliser la route d'enregistrement spécifique
          response = await api.post(
            '/comptables/register', 
            comptableData
          );
          
          console.log('Réponse de la création:', {
            status: response.status,
            data: response.data
          });
          
          if (response.data && response.data.success) {
            toast.success('Comptable créé avec succès');
          } else {
            const errorMsg = response.data?.message || 'Erreur lors de la création du comptable';
            console.error(errorMsg);
            throw new Error(errorMsg);
          }
        } catch (createError) {
          console.error('Erreur lors de la création du comptable:', {
            message: createError.message,
            response: createError.response?.data,
            status: createError.response?.status
          });
          throw createError;
        }
      }
      
      // Réinitialiser le formulaire et rafraîchir la liste
      console.log('Réinitialisation du formulaire et rafraîchissement de la liste');
      resetForm();
      await fetchComptables();
      
    } catch (error) {
      console.error('Erreur lors de la création/mise à jour du comptable:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Gestion spécifique des erreurs
      if (error.response) {
        if (error.response.status === 400) {
          // Erreur de validation
          const errorMessage = error.response.data.message || 'Données invalides';
          toast.error(`Erreur de validation: ${errorMessage}`);
        } else if (error.response.status === 403) {
          // Accès refusé
          toast.error('Accès refusé. Vous n\'avez pas les droits nécessaires.');
        } else if (error.response.status === 409) {
          // Conflit (email ou CIN déjà utilisé)
          toast.error(error.response.data.message || 'Cette adresse email ou ce CIN est déjà utilisé');
        } else {
          // Autre erreur serveur
          toast.error(error.response.data?.message || 'Erreur serveur');
        }
        
        // Si le token est invalide ou expiré
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('profile');
          navigate('/login');
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Aucune réponse du serveur:', error.request);
        toast.error('Le serveur ne répond pas. Vérifiez votre connexion.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration de la requête:', error.message);
        toast.error('Erreur de configuration. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (comptable) => {
    setFormData({
      name: comptable.name,
      lastname: comptable.lastname,
      cin: comptable.cin,
      email: comptable.email,
      password: '',
      confirmPassword: ''
    });
    setEditingId(comptable._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce comptable ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Aucun token trouvé dans le localStorage');
        toast.error('Veuillez vous reconnecter');
        navigate('/login');
        return;
      }

      console.log(`Suppression du comptable avec l'ID: ${id}`);
      
      // Utilisation de l'URL corrigée avec /api/comptables (au pluriel)
      const response = await api.delete(`/comptables/${id}`);
      
      console.log('Réponse de suppression:', response.data);
      
      if (response.data && response.data.success) {
        toast.success('Comptable supprimé avec succès');
        // Recharger la liste des comptables
        fetchComptables();
      } else {
        throw new Error(response.data?.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du comptable:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Gestion spécifique des erreurs
      if (error.response) {
        if (error.response.status === 403) {
          toast.error('Accès refusé. Vous n\'avez pas les droits nécessaires.');
        } else if (error.response.status === 404) {
          toast.error('Comptable non trouvé. Il a peut-être déjà été supprimé.');
        } else if (error.response.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(`Erreur serveur (${error.response.status})`);
        }
        
        // Si le token est invalide ou expiré
        if (error.response.status === 401 || error.response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error('Aucune réponse du serveur:', error.request);
        toast.error('Le serveur ne répond pas. Veuillez réessayer plus tard.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration de la requête:', error.message);
        toast.error('Erreur de configuration. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      lastname: '',
      cin: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="relative min-h-[calc(100vh-56px)] p-6 bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-56px)] p-6 bg-slate-50 overflow-hidden">
      {/* Panneau de profil */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${profileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ease-out"
          onClick={() => (window.location.hash = '')}
        />
        <aside 
          className={`absolute left-0 top-0 h-full w-full max-w-md bg-white/90 backdrop-blur-lg border-r border-white/70 shadow-2xl overflow-auto transform transition-transform duration-300 ease-out ${profileOpen ? 'translate-x-0' : '-translate-x-full'} rounded-r-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Mon Profil</h2>
              <button 
                onClick={() => (window.location.hash = '')}
                className="text-slate-400 hover:text-slate-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-20 w-20 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700 mb-3">
              {profile.name?.[0] || 'A'}
            </div>
            <h3 className="text-lg font-medium text-slate-900">{profile.name} {profile.lastname}</h3>
            <p className="text-sm text-slate-500">{profile.role || 'Administrateur'}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-slate-900">{profile.email || '—'}</p>
            </div>
            
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Rôle</p>
              <p className="text-sm text-slate-900">Super Administrateur</p>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div className="mx-auto max-w-7xl">
      {/* En-tête */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Comptables</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez les comptes des comptables de votre entreprise
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
          <button
            onClick={() => (window.location.hash = 'profile')}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            aria-label="Profil"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>

      {!showAddForm && (
        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(true)}
            variant="primary"
            className="inline-flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un comptable
          </Button>
        </div>
      )}

      {showAddForm && (
        <Card 
          className="mb-8"
          title={editingId ? 'Modifier le Comptable' : 'Nouveau Comptable'}
          icon={
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
            </svg>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  CIN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cin"
                  value={formData.cin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mot de passe {!editingId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  required={!editingId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmer le mot de passe {!editingId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  required={!editingId}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                onClick={resetForm}
                variant="secondary"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {editingId ? 'Mettre à jour' : 'Créer le compte'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des comptables */}
      <Card 
        title="Liste des Comptables"
        icon={
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
          </svg>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nom & Prénom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  CIN
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {comptables.length > 0 ? (
                comptables.map((comptable) => (
                  <tr key={comptable._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium">
                          {comptable.name?.[0] || 'C'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {comptable.name} {comptable.lastname}
                          </div>
                          <div className="text-xs text-slate-500">
                            {comptable.role || 'Comptable'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {comptable.cin || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {comptable.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(comptable)}
                          className="text-brand-600 hover:text-brand-900"
                          title="Modifier"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(comptable._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <svg className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">Aucun comptable trouvé</p>
                      <p className="text-xs mt-1">Commencez par ajouter un nouveau comptable</p>
                      <Button 
                        onClick={() => setShowAddForm(true)}
                        variant="primary"
                        className="mt-4"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter un comptable
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </div>
)
}