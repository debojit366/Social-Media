import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  Trash2, Edit3, Flag, Link2, Check, X, Camera, Send 
} from 'lucide-react';
import { format } from 'timeago.js';

const PostCard = ({ post }) => {
  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  // --- States ---
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef();

  // --- Edit Mode States ---
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(post.description);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(post.img);
  const [loading, setLoading] = useState(false);

  // --- Comment States ---
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]); // Empty initial state for fetching

  // Dropdown Close Handler
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowOptions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- Fetch Comments (getPostComments) ---
  useEffect(() => {
    if (showComments) {
      const fetchComments = async () => {
        try {
          const res = await axios.get(`http://localhost:8080/api/v1/comments/${post._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setComments(res.data);
        } catch (err) {
          console.error("Error fetching comments", err);
        }
      };
      fetchComments();
    }
  }, [showComments, post._id, token]);

  // --- Add Comment Handler ---
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      // Controller req.body: { content, postId }
      const res = await axios.post(`http://localhost:8080/api/v1/comments`, 
        { content: commentInput, postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Controller returns populated savedComment
      setComments([res.data, ...comments]);
      setCommentInput("");
    } catch (err) {
      alert("Failed to post comment");
    }
  };

  // --- Delete Comment Handler ---
  const handleCommentDelete = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      try {
        await axios.delete(`http://localhost:8080/api/v1/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComments(comments.filter(c => c._id !== commentId));
      } catch (err) {
        alert("Authorization failed or Error deleting");
      }
    }
  };

  // --- Post Handlers (Like/Delete/Update) ---
  const handleLike = async () => { /* Same logic as before */ };
  const handleDelete = async () => { /* Same logic as before */ };
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("description", description);
      if (file) formData.append("img", file);
      await axios.put(`http://localhost:8080/api/v1/posts/${post._id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setIsEditing(false); window.location.reload();
    } catch (err) { alert("Update failed"); } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 mb-6 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
            {post.userId?.firstName?.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-none">{post.userId?.firstName} {post.userId?.lastName}</h4>
            <p className="text-xs text-gray-400 mt-1 font-medium">{format(post.createdAt)}</p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowOptions(!showOptions)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50">
            <MoreHorizontal size={20} />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2">
              <MenuOption icon={<Link2 size={16}/>} label="Copy Link" />
              {post.userId?._id === currentUser?._id && (
                <>
                  <MenuOption icon={<Edit3 size={16}/>} label="Edit Post" onClick={() => { setIsEditing(true); setShowOptions(false); }} />
                  <MenuOption icon={<Trash2 size={16}/>} label="Delete" danger onClick={handleDelete} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Content Area (In-place Edit) */}
      <div className="px-5 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea 
              className="w-full h-28 p-4 bg-gray-50 border border-indigo-100 rounded-2xl outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="relative rounded-2xl overflow-hidden border">
              <img src={preview} className="w-full h-48 object-cover opacity-70" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold cursor-pointer">
                <Camera size={20} className="mr-2" /> Change Photo
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  setFile(e.target.files[0]);
                  setPreview(URL.createObjectURL(e.target.files[0]));
                }} />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 rounded-xl"><X size={20}/></button>
              <button onClick={handleUpdate} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl">
                {loading ? "..." : <><Check size={18}/> Save</>}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 mb-3">{description}</p>
            {preview && <img src={preview} className="w-full max-h-[500px] object-cover rounded-[1.5rem]" />}
          </>
        )}
      </div>

      {/* Action Bar */}
      <div className="p-4 flex items-center justify-between border-t border-gray-50">
        <div className="flex items-center gap-1">
          <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isLiked ? "text-red-500 bg-red-50" : "text-gray-500"}`}>
            <Heart size={20} className={isLiked ? "fill-current" : ""} />
            <span className="text-sm font-bold">{likeCount}</span>
          </button>
          
          <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${showComments ? "bg-blue-50 text-blue-500" : "text-gray-500"}`}>
            <MessageCircle size={20} />
            <span className="text-sm font-bold">Comments</span>
          </button>
        </div>
        <button className="p-2 text-gray-500"><Share2 size={20} /></button>
      </div>

      {/* --- Comments Section (According to your Controller) --- */}
      {showComments && (
        <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-50">
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold">
              {currentUser?.username?.charAt(0) || "U"}
            </div>
            <div className="relative flex-1">
              <input 
                type="text" placeholder="Write a comment..."
                className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 px-4 pr-12 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={commentInput} onChange={(e) => setCommentInput(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1.5 p-1.5 text-indigo-500"><Send size={18} /></button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c._id} className="flex gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase">
                  {c.user?.username?.charAt(0)}
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex-1 relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-gray-900">{c.user?.username}</span>
                    <span className="text-[10px] text-gray-400">{format(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.content}</p>

                  {/* Delete Button for comment owner or post owner (As per your controller) */}
                  {(c.user?._id === currentUser?._id || post.userId?._id === currentUser?._id) && (
                    <button 
                      onClick={() => handleCommentDelete(c._id)}
                      className="absolute -right-2 -top-2 p-1 bg-white border shadow-sm rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MenuOption = ({ icon, label, onClick, danger }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold hover:bg-gray-50 ${danger ? 'text-red-500' : 'text-gray-600'}`}>
    {icon} {label}
  </button>
);

export default PostCard;