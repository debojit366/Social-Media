import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', formData);
      
      if (response.data) {
        console.log("Login successful:", response.data);
        localStorage.setItem("profile", JSON.stringify(response.data));
        navigate("/"); 
        window.location.reload(); 
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.response?.data?.message || "Invalid credentials!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-blue-600 tracking-tighter">Connectify</h1>
          <p className="text-gray-500 mt-3 font-medium text-lg">Hello! Login with your phone.</p>
        </div>

        {error && <p className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-center text-sm font-semibold border border-red-100">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Phone Number</label>
            <input 
              type="tel"
              required
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-lg"
              placeholder="Enter your mobile number"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-lg"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95 text-lg"
          >
            Sign In
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-600 font-medium">
            New here? 
            <Link to="/register" className="text-blue-600 font-bold ml-2 hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;