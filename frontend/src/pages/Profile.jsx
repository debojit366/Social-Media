import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { MapPin, Calendar, Edit3, Image as ImageIcon, Send, X, Lock } from 'lucide-react';
import PostCard from '../components/PostCard';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const postImageRef = useRef(null);

  const loggedInUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");
  
  const isOwnProfile = !id || id === loggedInUser?._id;
  const targetId = id || loggedInUser?._id;

  const config = {
    headers: { 'Authorization': `Bearer ${token}` }
  };
  const handleFollowToggle = async () => {
  try {
    const res = await axios.patch(`http://localhost:8080/api/v1/users/${user._id}/request`, {}, config);
    
    fetchProfileData();
    console.log("Follow toggle response:", res.data);
  } catch (err) {
    console.log("Follow error:", err);
  }
};
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const userRes = await axios.get(`http://localhost:8080/api/v1/users/find/${targetId}`, config);
      setUser(userRes.data);

      const postsRes = await axios.get(`http://localhost:8080/api/v1/posts/user-posts/${targetId}`, config);
      setUserPosts(postsRes.data);
    } catch (err) {
      console.log("Error fetching profile data", err);
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !postImage) return;

    const data = new FormData();
    data.append("description", newPost);
    if (postImage) data.append("img", postImage);

    try {
      const postConfig = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      await axios.post("http://localhost:8080/api/v1/posts/", data, postConfig);
      setNewPost("");
      setPostImage(null);
      setImagePreview(null);
      fetchProfileData();
    } catch (err) {
      alert("Unable to create post");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-indigo-600">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto pt-20 pb-10 px-4">
        
        {/* Profile Header*/}
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
                <p className="text-gray-400 font-medium">@{user.username}</p>
              </div>
              
              {/* Button Toggle: Edit Profile vs Follow */}
              {isOwnProfile ? (
                <button 
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100" 
                  onClick={()=> navigate('/edit-profile')}
                >
                  <Edit3 size={18}/> Edit Profile
                </button>
              ) : (
                <button 
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg ${
                      user.followers?.includes(loggedInUser._id) 
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {user.followers?.includes(loggedInUser._id) ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-white">
              <h3 className="font-black text-gray-900 mb-4">About</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {user.bio ? user.bio : "No bio available."}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Create Post */}
            {isOwnProfile && (
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
                    {imagePreview && (
                      <div className="relative mt-4 mb-2 rounded-2xl overflow-hidden border">
                        <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                        <button onClick={() => {setPostImage(null); setImagePreview(null);}} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full"><X size={18} /></button>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <input type="file" hidden ref={postImageRef} accept="image/*" onChange={handleImageChange} />
                      <button onClick={() => postImageRef.current.click()} className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                        <ImageIcon size={20} className="text-indigo-500" /> Add Photo
                      </button>
                      <button onClick={handlePostSubmit} disabled={!newPost.trim() && !postImage} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold disabled:opacity-50">
                        Post <Send size={18} className="inline ml-2"/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Area with Privacy Check */}
            <div>
              <h3 className="font-black text-gray-900 mb-6 text-xl px-2">
                {isOwnProfile ? "Your Timeline" : `${user.firstName}'s Timeline`}
              </h3>
              
              {/* Privacy Logic */}
              {user.isPrivate && !isOwnProfile && !user.followers?.includes(loggedInUser._id) ? (
                <div className="bg-white p-12 rounded-[2rem] text-center border border-gray-100 shadow-sm">
                  <Lock size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold text-lg">This Account is Private</p>
                  <p className="text-gray-400 text-sm mt-1">Follow this user to see their posts.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {userPosts.length > 0 ? (
                    userPosts.map((post) => <PostCard key={post._id} post={post} />)
                  ) : (
                    <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-gray-100">
                      <p className="text-gray-400 font-bold">No posts to show</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;