import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Flame, UserPlus } from 'lucide-react';
import PostCard from '../components/PostCard';

const Timeline = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/v1/posts/timeline/all", config);
      setPosts(res.data);
    } catch (err) {
      console.log("Timeline error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-10 gap-8">
        
        {/* CENTER: FEED (Now wider - taking 7 columns) */}
        <div className="col-span-1 lg:col-span-7 space-y-6">
          {/* Quick Create Post Header */}
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-white flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex-shrink-0 overflow-hidden hidden sm:flex items-center justify-center font-bold text-indigo-600">
               {currentUser?.profilePicture ? (
                 <img src={currentUser.profilePicture} alt="me" className="w-full h-full object-cover" />
               ) : currentUser?.firstName?.charAt(0)}
            </div>
            <div 
              className="flex-1 bg-gray-50 rounded-2xl px-5 py-3 cursor-pointer hover:bg-gray-100 transition-all text-gray-400 flex items-center justify-between border border-transparent hover:border-indigo-100" 
              onClick={() => navigate(`/profile/${currentUser?._id}`)}
            >
              <span className="font-medium text-sm sm:text-base text-gray-500">
                What's on your mind, {currentUser?.firstName}?
              </span>
              <ImageIcon className="text-indigo-500" size={20} />
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
                <p className="text-gray-300 text-sm mt-1">Follow friends to see their latest updates!</p>
                <button 
                  onClick={() => navigate('/search')} 
                  className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                >
                  Explore People
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: TRENDING & SUGGESTIONS  */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          {/* Trending Card */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Flame className="text-orange-500" size={20} />
              </div>
              <h3 className="font-black text-gray-900">Trending Now</h3>
            </div>
            
            <div className="space-y-5">
              <TrendItem tag="#MERNStack" posts="1.2k" />
              <TrendItem tag="#Connectify" posts="850" />
              <TrendItem tag="#ReactJS" posts="2.4k" />
              <TrendItem tag="#WebDev" posts="5.1k" />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
               <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <UserPlus className="text-indigo-600" size={20} />
                </div>
                <h3 className="font-black text-gray-900 text-sm">Suggestions</h3>
              </div>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-4">
                Looking for new connections? Check out our explore page to find more buddies.
              </p>
              <button 
                onClick={() => navigate('/search')} 
                className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                Find People
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-component for Trends
const TrendItem = ({ tag, posts }) => (
  <div className="cursor-pointer group">
    <p className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mb-0.5">{tag}</p>
    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{posts} Posts</p>
  </div>
);

export default Timeline;