import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Calendar, Edit3, Image as ImageIcon, Send } from 'lucide-react';
import PostCard from '../components/PostCard';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const navigate = useNavigate();
const currentUser = JSON.parse(localStorage.getItem("profile"));
const token = localStorage.getItem("token");
const config = {
    headers: { 
        'Authorization': `Bearer ${token}`
    }
}

  useEffect(() => {
    fetchUserPosts();
    setUser(currentUser);
  }, []);

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/posts/user-posts`,config);
    //   console.log(res.data);
      setUserPosts(res.data);
    } catch (err) {
      console.log("Error fetching posts", err);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    const postData = {
        description: newPost
    }
    try {
      const res = await axios.post("http://localhost:8080/api/v1/posts/",postData,config);
      console.log(res);
      setNewPost("");
      fetchUserPosts();
    } catch (err) {
      alert("unable to create post");
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto pt-20 pb-10 px-4">
        
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-white mb-8">
           <div className="h-60 bg-gradient-to-r from-indigo-500 to-blue-600 relative">
            {user.coverPicture && <img src={user.coverPicture} className="w-full h-full object-cover" alt="cover" />}
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 rounded-[2rem] bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-[1.8rem] bg-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-600 overflow-hidden">
                  {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" alt="pfp" /> : user.firstName?.charAt(0)}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-20 px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-gray-900">{user.firstName} {user.lastName}</h1>
                <p className="text-gray-400 font-medium">@ {user.username}</p>
              </div>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100" onClick={()=> navigate('/edit-profile')}>
                <Edit3 size={18}/> Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-white">
              <h3 className="font-black text-gray-900 mb-4">About</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {user.bio ? user.bio : "Tell us about Yourself"}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-white">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold">
                  {user.firstName?.charAt(0)}
                </div>
                <div className="flex-1">
                  <textarea 
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={`What's on your mind, ${user.firstName}?`}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 resize-none h-28"
                  />
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <button className="flex items-center gap-2 text-gray-500 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all font-bold text-sm">
                      <ImageIcon size={20} className="text-indigo-500" />
                      Add Photo
                    </button>
                    
                    <button 
                      onClick={handlePostSubmit}
                      disabled={!newPost.trim()}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-md shadow-indigo-100"
                    >
                      <span>Post</span>
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-black text-gray-900 mb-6 text-xl px-2">Your Timeline</h3>
              <div className="space-y-6">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => <PostCard key={post._id} post={post} />)
                ) : (
                  <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold">No posts yet</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;