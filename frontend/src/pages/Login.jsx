import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ phoneNumber: '', password: '' });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;


    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', formData);
      if (response.data) {
        localStorage.setItem("profile", JSON.stringify(response.data.user));
        // console.log("Login successful:", response.data);
        navigate("/"); 
        window.location.reload(); 
      }
    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-[0_22px_70px_4px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row border border-white">
        
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-12 text-white flex-col justify-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tight mb-4 text-white">Connectify</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Welcome back! Ready to see what's happening in your circle?
            </p>
          </div>
        </div>

        <div className="flex-1 p-8 md:p-14 bg-white">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">Login</h2>
            <p className="text-gray-400 mt-3 font-medium text-lg">Enter your details to continue.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                required
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-gray-800 placeholder:text-gray-300 text-lg shadow-sm"
                placeholder="10 digit mobile number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 font-semibold hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-gray-800 placeholder:text-gray-300 text-lg shadow-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.97] text-lg mt-4"
            >
              Sign In
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-400 font-medium">
              New to Connectify? 
              <Link to="/register" className="text-blue-600 font-extrabold ml-2 hover:text-blue-800 transition-colors">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;