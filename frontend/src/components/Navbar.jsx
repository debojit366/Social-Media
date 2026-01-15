import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  MessageCircle, 
  User, 
  LogOut,
  Bell,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const profileData = localStorage.getItem("profile");
  const currentUser = profileData ? JSON.parse(profileData) : null;

  const handleLogout = () => {
    localStorage.removeItem("profile");
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  const navBtnClass = ({ isActive }) => 
    `p-2.5 rounded-xl transition-all ${
      isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl">C</span>
          </div>
          <span className="text-xl font-black text-gray-900 hidden sm:block tracking-tight">Connectify</span>
        </Link>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-2xl w-full max-w-md mx-8 group focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all border border-transparent">
          <Search size={18} className="text-gray-400 group-focus-within:text-indigo-600" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search friends, posts..." 
            className="bg-transparent border-none outline-none ml-3 w-full text-sm text-gray-700 placeholder:text-gray-400"
          />
        </form>

        {/* NAV ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          <NavLink to="/" className={navBtnClass} title="Timeline" end>
            <Home size={24} />
          </NavLink>

          <NavLink to="/messages" className={navBtnClass} title="Messages">
            <div className="relative">
              <MessageCircle size={24} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          </NavLink>

          <NavLink to="/notifications" className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 transition-all hidden sm:block">
            <Bell size={24} />
          </NavLink>

          {/* SETTINGS BUTTON */}
          <NavLink to="/settings" className={navBtnClass} title="Settings">
            <Settings size={24} />
          </NavLink>

          <div className="w-[1px] h-8 bg-gray-100 mx-2 hidden sm:block"></div>

          {/* USER PROFILE & LOGOUT */}
          <div className="flex items-center gap-3">
            <NavLink 
              to={`/profile/${currentUser?._id}`} 
              className={({ isActive }) => 
                `flex items-center gap-2 p-1 pr-3 rounded-2xl transition-all border ${
                  isActive ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'hover:bg-gray-50 border-transparent'
                }`
              }
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shadow-sm">
                {currentUser?.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="pfp" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <span className={`text-sm font-bold hidden lg:block uppercase tracking-tight ${
                location.pathname.includes('/profile') ? 'text-indigo-600' : 'text-gray-700'
              }`}>
                {currentUser?.firstName || "Profile"}
              </span>
            </NavLink>

            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;