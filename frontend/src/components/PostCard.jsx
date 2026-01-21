import React, { useState } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { format } from 'timeago.js';

const PostCard = ({ post }) => {
  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

      await axios.put(`http://localhost:8080/api/posts/${post._id}/like`, 
        { userId: currentUser._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to like post", err);
      setIsLiked(!isLiked); 
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 mb-6 overflow-hidden transition-all hover:shadow-md">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm">
            {post.userId?.firstName?.charAt(0) || "U"}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-none">{post.userId?.firstName} {post.userId?.lastName}</h4>
            <p className="text-xs text-gray-400 mt-1 font-medium">{format(post.createdAt)}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:bg-gray-50 p-2 rounded-xl">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div className="px-5 pb-3">
        <p className="text-gray-700 leading-relaxed">{post.description}</p>
      </div>
      
      {post.img && (
        <div className="px-2">
          <img 
            src={post.img} 
            alt="post" 
            className="w-full h-auto max-h-[500px] object-cover rounded-[1.5rem]" 
          />
        </div>
      )}

      <div className="p-4 flex items-center justify-between border-t border-gray-50 mt-2">
        <div className="flex items-center gap-1">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors group ${
              isLiked ? "bg-red-50 text-red-500" : "hover:bg-red-50 text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart 
              size={20} 
              className={`transition-transform group-active:scale-125 ${isLiked ? "fill-current" : ""}`} 
            />
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

export default PostCard;