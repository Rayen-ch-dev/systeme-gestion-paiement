
export default function SuperAdminDashboard() {
  const HandleCreation = () => {
    window.location.href = "/CreateNewAdmin";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Dashboard Header */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-6 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Super Admin Dashboard
        </h1>
        <button
          onClick={HandleCreation}
          className="px-5 py-2 bg-brand-600 text-white font-semibold rounded-lg shadow-md hover:bg-brand-400 hover:shadow-lg transition-all duration-200"
        >
          + Create New Admin
        </button>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Total Admins
          </h2>
          <p className="text-3xl font-bold text-blue-600">1</p>
        </div>


      </div>
    </div>
  );
}

