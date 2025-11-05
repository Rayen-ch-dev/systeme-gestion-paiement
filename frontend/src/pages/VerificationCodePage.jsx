import React, { useState } from "react";

export default function VerificationCodePage() {
  const [code, setCode] = useState("");
  const [retypeCode, setRetypeCode] = useState("");
  const [error, setError] = useState("");

  // Simulate the code sent to the user's email (in real case, fetch from backend)
  const sentCode = "123456"; 

  const handleVerify = (e) => {
    e.preventDefault();

    if (code === "" || retypeCode === "") {
      setError("Please fill in both fields.");
      return;
    }

    if (code !== retypeCode) {
      setError("Codes do not match. Please try again.");
      return;
    }

    if (code !== sentCode) {
      setError("Invalid verification code.");
      return;
    }

    window.location.href ="/reset-password";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleVerify}
        className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Vérifiez votre code
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Saisissez le code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Saisissez le code envoyé"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Saisir à nouveau le code</label>
          <input
            type="text"
            value={retypeCode}
            onChange={(e) => setRetypeCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Saisissez à nouveau le code"
          />
        </div>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>} 
  <div className="flex gap-2">
  <a
    href="/login"
    className="w-1/2 text-center bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 transition-colors"
  >
    Cancel
  </a>

  <button
    type="submit"
    className="w-1/2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
  >
    Vérifier
  </button>
</div>

      </form>
    </div>
  );
}
