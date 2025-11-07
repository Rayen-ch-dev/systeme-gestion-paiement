import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Composant de carte utilisateur
const UserCard = ({ user, onStatusUpdate, onDelete }) => {
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'actif': 'bg-green-100 text-green-800',
      'approuvé': 'bg-green-100 text-green-800',
      'inactif': 'bg-red-100 text-red-800',
      'non-approuvé': 'bg-red-100 text-red-800',
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'en-attente': 'bg-yellow-100 text-yellow-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-medium text-gray-900 truncate">
              {user.name} {user.lastname}
            </p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusBadgeClass(user.status)}`}>
              {user.status || 'N/A'}
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {user.role === 'formateur' ? 'Formateur' : 
             user.role === 'comptable' ? 'Comptable' : 
             user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
          </span>
          <div className="flex space-x-2">
            {user.status !== 'actif' && user.status !== 'approuvé' && (
              <button
                onClick={() => onStatusUpdate(user._id, 'approuvé')}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Approuver
              </button>
            )}
            <button
              onClick={() => onDelete(user._id)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Check authentication and fetch users on component mount
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user || !user.role) {
        console.log('No token or user data found, redirecting to login');
        navigate('/login');
        return;
      }
      
      // Allow comptable, super_admin to access the dashboard
      // Note: 'admin' role is not defined in the User model, only 'comptable' and 'super_admin'
      if (['comptable', 'super_admin'].includes(user.role)) {
        try {
          await fetchUsers();
        } catch (error) {
          console.error('Error fetching users:', error);
          if (error.response?.status === 401) {
            // If user doesn't have the right role, redirect to their dashboard
            if (user.role === 'super_admin') {
              navigate('/superadmin/dashboard');
            } else if (user.role === 'comptable') {
              navigate('/admin/dashboard');
            } else {
              // Redirect to default dashboard for other roles
              navigate('/dashboard');
            }
          }
        }
      } else {
        // Redirect to appropriate dashboard based on role
        navigate('/');
      }
    };

    checkAuthAndFetch();
  }, []);

  // Fetch users when filter changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUsers().catch(console.error);
    }
  }, [filter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      console.warn('No authentication token found');
      setIsLoading(false);
      navigate('/login');
      return;
    }
    
    try {
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true,
        timeout: 10000
      };
      
      // Utiliser le bon endpoint en fonction du rôle de l'utilisateur
      let url = '/api/users';
      
      // Si l'utilisateur est un comptable ou un super_admin, utiliser l'endpoint des comptables
      if (['comptable', 'super_admin'].includes(user.role)) {
        url = '/api/comptables/users';
        
        // Ajouter le filtre de statut si spécifié
        if (filter) {
          // S'assurer que le paramètre de requête est correctement formaté
          const separator = url.includes('?') ? '&' : '?';
          url += `${separator}status=${encodeURIComponent(filter)}`;
        }
      }
      
      console.log('Fetching users from:', url);
      
      const response = await axios.get(url, config);
      
      // Gérer la réponse en fonction de la structure de la réponse
      if (response.data?.success) {
        // Si la réponse contient un tableau 'data', l'utiliser, sinon utiliser directement la réponse
        const usersData = Array.isArray(response.data.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
        
        console.log('Users loaded:', usersData.length);
        setUsers(usersData);
      } else {
        // Si la réponse ne contient pas de propriété 'success', supposer que c'est un tableau direct
        if (Array.isArray(response.data)) {
          console.log('Users loaded (direct array):', response.data.length);
          setUsers(response.data);
        } else {
          throw new Error(response.data?.message || 'Format de réponse inattendu du serveur');
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const message = error.response?.data?.message || error.message;
      
      // Don't show error if it's a 401 and we're already redirecting
      if (!(error.response?.status === 401 && !localStorage.getItem('token'))) {
        toast.error(message);
      }
      
      setUsers([]);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, newStatus) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      toast.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }
    
    try {
      const baseUrl = user.role === 'super_admin' ? '/api/users' : '/api/comptables/users';
      const response = await axios.put(
        `${baseUrl}/${userId}/status`,
        { status: newStatus },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (response.data?.success) {
        toast.success(response.data.message || "Statut mis à jour avec succès");
        fetchUsers();
      } else {
        throw new Error(response.data?.message || "Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      return;
    }
    
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      toast.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login');
      return;
    }
    
    try {
      const baseUrl = user.role === 'super_admin' ? '/api/users' : '/api/comptables/users';
      const response = await axios.delete(
        `${baseUrl}/${userId}`, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (response.data?.success) {
        toast.success("Utilisateur supprimé avec succès");
        fetchUsers();
      } else {
        throw new Error(response.data?.message || "Erreur lors de la suppression de l'utilisateur");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const message = error.response?.data?.message || "Une erreur est survenue lors de la suppression de l'utilisateur";
      toast.error(message);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Déconnexion réussie');
  };
  
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchLower) || 
      user.email?.toLowerCase().includes(searchLower) ||
      (user.lastname?.toLowerCase().includes(searchLower) || '') ||
      (user.cin?.toLowerCase().includes(searchLower) || '');
    
    if (!filter) return matchesSearch;
    
    // Handle different status formats
    const userStatus = user.status?.toLowerCase();
    const filterStatus = filter.toLowerCase();
    
    // Map alternative status values
    const statusMap = {
      'actif': ['actif', 'active', 'approuvé'],
      'inactif': ['inactif', 'inactive', 'non-approuvé'],
      'en_attente': ['en_attente', 'en-attente', 'pending']
    };
    
    if (statusMap[filterStatus]) {
      return matchesSearch && statusMap[filterStatus].includes(userStatus);
    }
    
    return matchesSearch && userStatus === filterStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L3.586 4H4a1 1 0 010-2zm4 16a1 1 0 100-2H6.414l2.293-2.293a1 1 0 00-1.414-1.414L3.586 16H4a1 1 0 110 2h4z" clipRule="evenodd" />
              </svg>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Gestion des utilisateurs
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4
          ">
            <div className="relative rounded-md shadow-sm mr-4">
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <option value="">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="en_attente">En attente</option>
              <option value="inactif">Inactifs</option>
              <option value="non-approuvé">Non approuvés</option>
            </select>
          </div>
        </div>

        {/* Users list */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {isLoading ? (
            <LoadingSpinner />
          ) : filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 p-6">
              {filteredUsers.map((user) => (
                <UserCard 
                  key={user._id} 
                  user={user} 
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos critères de recherche.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}