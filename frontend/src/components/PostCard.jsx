import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  Trash2, Edit3, Flag, Link2 
} from 'lucide-react';
import { format } from 'timeago.js';

const PostCard = ({ post }) => {
  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef();

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

          {/* Actual Dropdown Menu */}
          
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-200">
              <MenuOption icon={<Link2 size={16}/>} label="Copy Link" />
              
              {post.userId?._id === currentUser?._id ? (
                <>
                  <MenuOption icon={<Edit3 size={16}/>} label="Edit Post" />
                  <MenuOption 
                    icon={<Trash2 size={16}/>} 
                    label="Delete" 
                    danger 
                    onClick={() => console.log("Delete Post ID:", post._id)} 
                  />
                </>
              ) : (
                <MenuOption icon={<Flag size={16}/>} label="Report" danger />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="px-5 pb-3">
        <p className="text-gray-700 leading-relaxed">{post.description}</p>
      </div>
      
      {post.img && (
        <div className="px-2">
          <img src={post.img} alt="post" className="w-full h-auto max-h-[500px] object-cover rounded-[1.5rem]" />
        </div>
      )}

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