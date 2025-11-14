import React, { useState,useEffect  } from "react";
import { getAllUsers } from "../api";
export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // hides after 3s
  };

  const handleAccept = (id) => {
    setPendingUsers(pendingUsers.filter((user) => user.id !== id));
    showNotification("User account accepted successfully!", "success");
  };

  const handleReject = (id) => {
    setPendingUsers(pendingUsers.filter((user) => user.id !== id));
    showNotification(" User account rejected.", "error");
  };
    useEffect(() => {
    (async () => {
      const result = await getAllUsers();
      if (result.ok) {
        setPendingUsers(result.users.users || []); 
      } else {
        showNotification(result.error || "Erreur lors du chargement des utilisateurs", "error");
      }
    })();
  }, []);


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
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
  <h1 className="text-2xl font-bold text-gray-800">Comptable Dashboard</h1>

  <div className="flex gap-3">
    <a
      href="/login"
      className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl shadow-lg hover:from-brand-600 hover:to-brand-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      Logout
    </a>

    <a
      href="/ProfileComptable"
      className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl shadow-lg hover:from-brand-600 hover:to-brand-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      Personal Information
    </a>
  </div>
</div>


      {/* Pending Users Section */}
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
                key={user.id}
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
                    onClick={() => handleAccept(user.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
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
