import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Send, X, Loader2 } from 'lucide-react';
import PostCard from '../components/PostCard';

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // States for Post Functionality
  const [newPost, setNewPost] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false); 
  const postImageRef = useRef(null);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchTimeline(); }, []);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/v1/posts/timeline", config);
      setPosts(res.data);
    } catch (err) { console.log("Timeline error", err); }
    finally { setLoading(false); }
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

    try {
      setUploading(true);
      const data = new FormData();
      data.append("description", newPost);
      if (postImage) data.append("img", postImage);

      await axios.post("http://localhost:8080/api/v1/posts/", data, {
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
      });
      
      setNewPost("");
      setPostImage(null);
      setImagePreview(null);
      setIsExpanded(false);
      fetchTimeline(); 
    } catch (err) {
      alert("Unable to create post");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-10 px-4">
      {/* Max-width reduced to 3xl for better readability without the sidebar */}
      <div className="max-w-3xl mx-auto"> 
        
        <div className="space-y-6">
          
          {/* POST CREATE SECTION */}
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-white transition-all duration-300">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex-shrink-0 overflow-hidden hidden sm:flex items-center justify-center font-bold text-indigo-600">
                 {currentUser?.profilePicture ? (
                   <img src={currentUser.profilePicture} alt="me" className="w-full h-full object-cover" />
                 ) : currentUser?.firstName?.charAt(0)}
              </div>
              
              <div className="flex-1">
                {/* Input Bar */}
                <div 
                  className={`bg-gray-50 rounded-2xl px-5 py-3 transition-all border border-transparent ${!isExpanded ? 'flex items-center justify-between cursor-pointer hover:bg-gray-100 hover:border-indigo-100' : ''}`}
                  onClick={() => !isExpanded && setIsExpanded(true)}
                >
                  {!isExpanded ? (
                    <>
                      <span className="font-medium text-sm sm:text-base text-gray-500">
                        What's on your mind, {currentUser?.firstName}?
                      </span>
                      <ImageIcon className="text-indigo-500" size={20} />
                    </>
                  ) : (
                    <textarea 
                      autoFocus
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder={`What's on your mind, ${currentUser?.firstName}?`}
                      className="w-full bg-transparent border-none outline-none text-gray-700 resize-none h-24"
                    />
                  )}
                </div>

                {/* Expanded Controls */}
                {isExpanded && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    {imagePreview && (
                      <div className="relative mb-4 rounded-2xl overflow-hidden border shadow-sm">
                        <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                        <button onClick={() => {setPostImage(null); setImagePreview(null);}} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <input type="file" hidden ref={postImageRef} accept="image/*" onChange={handleImageChange} />
                      <div className="flex gap-2">
                        <button onClick={() => postImageRef.current.click()} className="flex items-center gap-2 text-gray-500 font-bold text-sm hover:text-indigo-600 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-all">
                          <ImageIcon size={20} className="text-indigo-500" /> Add Photo
                        </button>
                        <button onClick={() => {setIsExpanded(false); setNewPost(""); setImagePreview(null);}} className="text-gray-400 font-bold text-sm px-3 py-2">Cancel</button>
                      </div>

                      <button 
                        onClick={handlePostSubmit} 
                        disabled={uploading || (!newPost.trim() && !postImage)} 
                        className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                      >
                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18}/>}
                        {uploading ? "Posting..." : "Post"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold">Fetching your timeline...</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-bold text-lg">Your feed is quiet...</p>
                <button onClick={() => navigate('/search')} className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100">Explore People</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Timeline;