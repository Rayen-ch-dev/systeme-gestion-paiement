import React, { useState, useEffect } from "react";
import { getAllUsers, validateUser } from "../api";

export default function AdminDashboard() {

  const [pendingUsers, setPendingUsers] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Charger les utilisateurs en attente

  useEffect(() => { 
    (async () => { 
      const result = await getAllUsers(); 
      if (result.ok) { setPendingUsers(result.users.users || []); 

      } else { showNotification(result.error || "Erreur lors du chargement des utilisateurs", "error"); 

      }
     })(); 
    }, []);

  // Accepter ou rejeter
  const handleStatusChange = async (id, status) => {
    const result = await validateUser(id, status);
    if (result.ok) {
      setPendingUsers(pendingUsers.filter((u) => u._id !== id));
      showNotification(
        status === "approuvé"
          ? "Utilisateur accepté avec succès ✅"
          : "Utilisateur rejeté ❌",
        status === "approuvé" ? "success" : "error"
      );
    } else {
      showNotification(result.error, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <a
          href="/ProfileComptable"
          className="inline-block px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 shadow-sm"
        >
          Personal Information
        </a>
      </div>

      {/* Pending Users */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Manage user requests
        </h2>

        {pendingUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No pending user requests.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="flex justify-between items-center border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {user.name} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-400">{user.role}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(user._id, "approuvé")}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(user._id, "non-approuvé")}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
