import React, { useState } from 'react';
import axios from 'axios';
import { 
  User, Lock, Bell, Shield, Eye, 
  ChevronRight, Trash2, Moon, Sun, 
  CheckCircle2, LogOut, Smartphone 
} from 'lucide-react';

const Settings = () => {
  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const handlePrivacyToggle = async () => {
    try {
      setLoading(true);
      const res = await axios.patch(`http://localhost:8080/api/v1/users/update-privacy`, 
        { isPrivate: !isPrivate }, config
      );
      setIsPrivate(!isPrivate);
      setSuccessMsg("Privacy settings updated");
      
      const updatedUser = { ...currentUser, isPrivate: !isPrivate };
      localStorage.setItem("profile", JSON.stringify(updatedUser));
      
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      // In a real app, handle error state here
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-slate-500 text-lg">
            Manage your account preferences and security.
          </p>
          
          {/* Floating Success Toast */}
          {successMsg && (
            <div className="absolute top-0 right-0 flex items-center gap-3 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-200 animate-in fade-in slide-in-from-top-4 duration-300">
              <CheckCircle2 size={20} className="text-white" />
              <span className="font-semibold text-sm">{successMsg}</span>
            </div>
          )}
        </div>

        {/* Section 1: Account */}
        <section className="space-y-4">
          <SectionHeader title="Account" />
          <div className="bg-white rounded-3xl p-2 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <SettingItem 
              icon={<User size={20} className="text-white"/>} 
              iconBg="bg-gradient-to-br from-indigo-500 to-violet-600"
              title="Edit Profile" 
              desc="Change your name, bio, and avatar"
              onClick={() => window.location.href='/edit-profile'}
            />
            
            <div className="h-px bg-slate-50 mx-4" />

            {/* Privacy Toggle Item */}
            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                  <Eye size={20} className="text-white"/>
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">Private Account</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Only followers see your posts</p>
                </div>
              </div>
              
              {/* Modern Toggle Switch */}
              <button 
                onClick={handlePrivacyToggle}
                disabled={loading}
                className={`w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 relative ${isPrivate ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${isPrivate ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Security */}
        <section className="space-y-4">
          <SectionHeader title="Security" />
          <div className="bg-white rounded-3xl p-2 shadow-xl shadow-slate-200/50 border border-slate-100">
            <SettingItem 
              icon={<Lock size={20} className="text-white"/>} 
              iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
              title="Password" 
              desc="Update your secure password"
            />
             <div className="h-px bg-slate-50 mx-4" />
            <SettingItem 
              icon={<Smartphone size={20} className="text-white"/>} 
              iconBg="bg-gradient-to-br from-orange-400 to-amber-500"
              title="Sessions" 
              desc="Manage logged in devices"
            />
          </div>
        </section>

        {/* Section 3: Preferences */}
        <section className="space-y-4">
          <SectionHeader title="Preferences" />
          <div className="bg-white rounded-3xl p-2 shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="flex items-center justify-between p-4 rounded-2xl group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-sm">
                    <Moon size={20} className="text-white" /> 
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700 text-sm">Dark Mode</span>
                    <span className="text-xs text-slate-400 font-medium">Adjust the appearance</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wide">Coming Soon</span>
             </div>
          </div>
        </section>

        {/* Section 4: Danger Zone */}
        <section className="pt-4">
          <button className="w-full group relative overflow-hidden bg-white border border-red-100 rounded-3xl p-1 shadow-sm hover:shadow-lg hover:shadow-red-100 transition-all duration-300">
            <div className="relative z-10 flex items-center justify-between p-4 rounded-2xl group-hover:bg-red-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <Trash2 size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800 text-sm group-hover:text-red-700">Delete Account</p>
                  <p className="text-xs text-slate-400 group-hover:text-red-400">Permanently remove all data</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-red-400 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </section>

        <div className="text-center pt-8">
            <p className="text-xs text-slate-400 font-medium">Connectify v1.0.2 • Made with ❤️</p>
        </div>

      </div>
    </div>
  );
};

// Reusable Sub-components for cleaner code
const SectionHeader = ({ title }) => (
  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-4 mb-2">
    {title}
  </h2>
);

const SettingItem = ({ icon, iconBg, title, desc, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 group"
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="font-bold text-slate-700 text-sm group-hover:text-indigo-900 transition-colors">{title}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
  </button>
);

export default Settings;