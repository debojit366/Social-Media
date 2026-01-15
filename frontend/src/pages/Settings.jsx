import React, { useState } from 'react';
import axios from 'axios';
import { 
  User, Lock, Bell, Shield, Eye, 
  ChevronRight, Trash2, Moon, Sun, 
  CheckCircle2 
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
      setSuccessMsg("Privacy updated successfully!");
      
      const updatedUser = { ...currentUser, isPrivate: !isPrivate };
      localStorage.setItem("profile", JSON.stringify(updatedUser));
      
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Error updating privacy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-400 font-medium">Manage your account preferences and security</p>
        </div>

        {successMsg && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 text-green-600 p-4 rounded-2xl border border-green-100 animate-bounce">
            <CheckCircle2 size={18} />
            <span className="font-bold text-sm">{successMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Section 1: Account Info */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-indigo-600" /> Account Settings
            </h2>
            
            <div className="space-y-4">
              <SettingItem 
                icon={<User size={18}/>} 
                title="Edit Profile" 
                desc="Change your name, bio, and profile picture"
                onClick={() => window.location.href='/edit-profile'}
              />
              
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Eye size={18}/></div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Private Account</p>
                    <p className="text-xs text-gray-400">Only followers can see your posts</p>
                  </div>
                </div>
                {/* Custom Toggle Switch */}
                <button 
                  onClick={handlePrivacyToggle}
                  disabled={loading}
                  className={`w-12 h-6 rounded-full transition-all relative ${isPrivate ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPrivate ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Security */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" /> Security & Login
            </h2>
            <SettingItem 
                icon={<Lock size={18}/>} 
                title="Change Password" 
                desc="Update your password to stay secure"
            />
          </div>

          {/* Section 3: Appearance */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Sun size={20} className="text-indigo-600" /> Appearance
            </h2>
            <div className="flex items-center justify-between p-4">
               <div className="flex items-center gap-4 text-sm font-bold text-gray-700">
                  <Moon size={18} /> Dark Mode
               </div>
               <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md uppercase">Coming Soon</span>
            </div>
          </div>

          {/* Section 4: Danger Zone */}
          <div className="bg-red-50/50 rounded-[2.5rem] p-8 border border-red-100">
            <h2 className="text-lg font-black text-red-600 mb-6 flex items-center gap-2">
              <Trash2 size={20} /> Danger Zone
            </h2>
            <button className="w-full text-left p-4 rounded-2xl bg-white border border-red-100 hover:bg-red-600 hover:text-white group transition-all">
              <p className="font-bold text-sm group-hover:text-white text-red-600">Delete Account</p>
              <p className="text-xs text-red-400 group-hover:text-red-100 transition-colors">Permanently remove your data from Connectify</p>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const SettingItem = ({ icon, title, desc, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer group border border-transparent"
  >
    <div className="flex items-center gap-4">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <p className="font-bold text-gray-800 text-sm">{title}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-gray-300" />
  </div>
);

export default Settings;