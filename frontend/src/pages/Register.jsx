import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registering:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">Join Us</h1>
          <p className="text-gray-500 mt-2 font-medium">Create your account to start sharing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Username</label>
            <input 
              type="text"
              required
              className="mt-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
              placeholder="johndoe123"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Email Address</label>
            <input 
              type="email"
              required
              className="mt-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
              placeholder="hello@example.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 ml-1">Password</label>
            <input 
              type="password"
              required
              className="mt-1 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all"
              placeholder="Create a strong password"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95">
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">Already a member? 
            <Link to="/login" className="text-blue-600 font-bold ml-1 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;