import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, ChevronLeft, User, Image as ImageIcon, Calendar, ChevronDown, Sparkles, Check } from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("profile")) || {};
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  
  const [previews, setPreviews] = useState({ 
    profile: user.profilePicture || '', 
    cover: user.coverPicture || '' 
  });

  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username || '',
    bio: user.bio || '',
    dob: user.dob ? user.dob.split('T')[0] : '',
    gender: user.gender || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("username", formData.username);
    data.append("bio", formData.bio);
    data.append("dob", formData.dob);
    data.append("gender", formData.gender);
    
    if (profileInputRef.current.files[0]) {
      data.append("image", profileInputRef.current.files[0]); 
    }
    if (coverInputRef.current.files[0]) {
      data.append("coverImage", coverInputRef.current.files[0]);
    }

    try {
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        } 
      };
      
      const res = await axios.patch(`http://localhost:8080/api/v1/users/update`, data, config);
      
      const updatedProfile = { ...user, ...res.data };
      localStorage.setItem("profile", JSON.stringify(updatedProfile));
      
      navigate("/profile", { replace: true });
    } catch (err) {
      console.error("Update Error:", err);
      alert(err.response?.data?.message || "Update failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-32 font-sans antialiased">
      <div className="max-w-lg mx-auto bg-white min-h-screen shadow-xl relative border-x border-gray-100">
      
        {/* Header */}
        <div className="flex items-center px-6 py-5 sticky top-0 bg-white/90 backdrop-blur-lg z-50 border-b border-slate-100">
          <div 
            className="p-2 mr-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all active:scale-90" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Edit Profile</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Setup your identity</p>
          </div>
        </div>

        {/* Photos Section */}
        <div className="relative mb-20">
          {/* Cover Photo */}
          <div 
            className="h-44 relative cursor-pointer overflow-hidden group bg-slate-100"
            onClick={() => coverInputRef.current.click()}
          >
            {previews.cover ? (
              <img src={previews.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50" />
            )}
            
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
              <div className="bg-white/90 px-4 py-2 rounded-xl shadow-xl text-indigo-600 font-bold text-xs flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all">
                <ImageIcon size={14} /> Change Cover
              </div>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="absolute left-8 -bottom-14 z-10">
            <div className="relative group cursor-pointer" onClick={() => profileInputRef.current.click()}>
              <div className="w-32 h-32 rounded-3xl border-[6px] border-white bg-white shadow-xl overflow-hidden relative rotate-3 transition-transform group-hover:rotate-0">
                {previews.profile ? (
                  <img src={previews.profile} className="w-full h-full object-cover" alt="profile" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                    <User size={44} className="text-slate-200" />
                  </div>
                )}
              </div>
              
              <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-3 rounded-2xl border-4 border-white shadow-lg transform transition-all group-hover:scale-110 active:scale-90">
                 <Camera size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Inputs */}
        <input type="file" hidden ref={coverInputRef} onChange={(e) => handleImageChange(e, 'cover')} />
        <input type="file" hidden ref={profileInputRef} onChange={(e) => handleImageChange(e, 'profile')} />

        {/* Form Fields */}
        <div className="px-8 space-y-10 mt-12">
          
          <div className="space-y-6">
            <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Sparkles size={14} className="fill-indigo-100" /> Identity
            </h3>
            <SimpleInputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
            <SimpleInputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            <SimpleInputField label="Username" name="username" value={formData.username} onChange={handleChange} />
          </div>

          <div className="space-y-6 pt-4">
             <h3 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em] mb-6">
              Preferences
            </h3>

            {/* Birthday */}
            <div className="group relative transition-all duration-300">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-focus-within:text-indigo-500">Birthday</label>
              <div className="flex items-center justify-between mt-2 px-4 py-3 bg-slate-50 rounded-2xl border border-transparent group-focus-within:border-indigo-100 group-focus-within:bg-white transition-all">
                <input 
                  name="dob"
                  type="date" 
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-slate-700 font-semibold text-sm"
                />
                <Calendar size={18} className="text-slate-300 group-focus-within:text-indigo-400" />
              </div>
            </div>

            {/* Gender */}
            <div className="group relative transition-all duration-300">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-focus-within:text-indigo-500">Gender Identity</label>
              <div className="relative mt-2">
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-transparent group-focus-within:border-indigo-100 group-focus-within:bg-white outline-none text-slate-700 font-semibold text-sm appearance-none cursor-pointer"
                >
                  <option value="">Choose one...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-3.5 text-slate-300 group-focus-within:text-indigo-400 pointer-events-none transition-transform group-focus-within:rotate-180" />
              </div>
            </div>

            {/* Bio */}
            <div className="group relative transition-all duration-300">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-focus-within:text-indigo-500">Bio</label>
              <textarea 
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Write something catchy..."
                className="w-full bg-slate-50 mt-2 px-4 py-3 rounded-2xl border border-transparent group-focus-within:border-indigo-100 group-focus-within:bg-white outline-none text-slate-700 font-medium text-sm resize-none placeholder:text-slate-300 leading-relaxed transition-all"
              />
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-8 z-[60]">
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-[2rem] font-bold text-sm shadow-2xl shadow-indigo-200 hover:bg-indigo-600 hover:shadow-indigo-400 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Save Changes 
                <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors">
                  <Check size={14} />
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const SimpleInputField = ({ label, name, value, onChange }) => (
  <div className="group relative transition-all duration-300">
    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider group-focus-within:text-indigo-500 transition-colors">{label}</label>
    <input 
      name={name}
      type="text" 
      value={value}
      onChange={onChange}
      className="w-full bg-slate-50 mt-2 px-4 py-3 rounded-2xl border border-transparent group-focus-within:border-indigo-100 group-focus-within:bg-white outline-none text-slate-700 font-semibold text-sm transition-all"
    />
  </div>
);

export default EditProfile;