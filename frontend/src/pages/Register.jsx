import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, AtSign } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    dob: '',
    gender: '',
    phoneNumber: '',
    password: ''
  });
  
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "username") {
      const formattedValue = value.toLowerCase();
      setFormData({ ...formData, [name]: formattedValue });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/register', formData);
      if (response.data) {
        navigate("/login");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row border border-white">
        
        <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-indigo-600 to-blue-500 p-12 text-white flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Connectify</h1>
            <p className="mt-4 text-blue-100 text-lg">Join the community of creators and thinkers.</p>
          </div>
          <div className="text-sm text-blue-200">© 2026 Connectify Inc.</div>
        </div>

        <div className="flex-1 p-8 md:p-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Create Account</h2>
            <p className="text-gray-400 mt-2 font-medium">It's quick and easy.</p>
          </div>

          {error && <p className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-sm font-semibold border border-red-100">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} placeholder="Aman" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} placeholder="Sharma" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                   <AtSign size={16} />
                </div>
                <input 
                  name="username" 
                  type="text" 
                  required 
                  value={formData.username} 
                  onChange={handleChange} 
                  placeholder="amansharma_01" 
                  className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Birthday</label>
                <input name="dob" type="date" required value={formData.dob} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-400" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Gender</label>
                <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-400 appearance-none">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
              <input name="phoneNumber" type="text" required value={formData.phoneNumber} onChange={handleChange} placeholder="10 Digit Number" className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.password}
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] mt-4">
              Get Started
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 font-medium">Already have an account? 
              <Link to="/login" className="text-indigo-600 font-bold ml-2 hover:text-indigo-800 transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;