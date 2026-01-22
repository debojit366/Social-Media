import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  Trash2, Edit3, Flag, Link2, Check, X, Camera 
} from 'lucide-react';
import { format } from 'timeago.js';

const PostCard = ({ post }) => {
  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef();

  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(post.description);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(post.img);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      await axios.put(`http://localhost:8080/api/v1/posts/${post._id}/like`, 
        { userId: currentUser._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setIsLiked(!isLiked); 
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/posts/${post._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        window.location.reload(); 
      } catch (err) {
        console.error("Delete failed", err);
        alert("Could not delete post.");
      }
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("description", description);
      if (file) formData.append("img", file);

      const res = await axios.put(`http://localhost:8080/api/v1/posts/${post._id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      setIsEditing(false);
      window.location.reload(); 
      console.log(res);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDescription(post.description);
    setPreview(post.img);
    setFile(null);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 mb-6 overflow-hidden transition-all hover:shadow-md">
      
      {/* Post Header */}
      <div className="flex items-center justify-between p-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm">
            {post.userId?.firstName?.charAt(0) || "U"}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-none">{post.userId?.firstName} {post.userId?.lastName}</h4>
            <p className="text-xs text-gray-400 mt-1 font-medium">{format(post.createdAt)}</p>
          </div>
        </div>

        {/* Options Menu Container */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className={`p-2 rounded-xl transition-colors ${showOptions ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <MoreHorizontal size={20} />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-200">
              <MenuOption icon={<Link2 size={16}/>} label="Copy Link" />
              
              {post.userId?._id === currentUser?._id ? (
                <>
                  <MenuOption 
                    icon={<Edit3 size={16}/>} 
                    label="Edit Post" 
                    onClick={() => { setIsEditing(true); setShowOptions(false); }} 
                  />
                  <MenuOption 
                    icon={<Trash2 size={16}/>} 
                    label="Delete" 
                    danger 
                    onClick={handleDelete} 
                  />
                </>
              ) : (
                <MenuOption icon={<Flag size={16}/>} label="Report" danger />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="px-5 pb-3">
        {isEditing ? (
          <div className="space-y-3 animate-in fade-in duration-200">
            <textarea 
              className="w-full h-28 p-4 bg-gray-50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none font-medium text-gray-700"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
            
            {/* Image Preview */}
            <div className="relative group rounded-2xl overflow-hidden border">
              <img src={preview} alt="preview" className="w-full h-48 object-cover opacity-70" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/30 text-white font-bold cursor-pointer opacity-100 transition-opacity">
                <Camera size={20} className="mr-2" /> Change Photo
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => {
                    const selected = e.target.files[0];
                    setFile(selected);
                    setPreview(URL.createObjectURL(selected));
                  }} 
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button 
                onClick={cancelEdit} 
                className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
              <button 
                onClick={handleUpdate} 
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                {loading ? "Saving..." : <><Check size={18} /> Save</>}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 leading-relaxed mb-3">{description}</p>
            {preview && (
              <div className="px-0">
                <img src={preview} alt="post" className="w-full h-auto max-h-[500px] object-cover rounded-[1.5rem]" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-4 flex items-center justify-between border-t border-gray-50 mt-2">
        <div className="flex items-center gap-1">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors group ${isLiked ? "bg-red-50 text-red-500" : "hover:bg-red-50 text-gray-500 hover:text-red-500"}`}
          >
            <Heart size={20} className={`transition-transform group-active:scale-125 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-bold">{likeCount}</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageCircle size={20} />
            <span className="text-sm font-bold">Comments</span>
          </button>
        </div>

        <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};

const MenuOption = ({ icon, label, onClick, danger }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50 ${danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-600'}`}
  >
    {icon}
    {label}
  </button>
);

export default PostCard;