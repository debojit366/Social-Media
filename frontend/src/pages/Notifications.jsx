import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Heart, UserPlus, MessageCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchNotifications();
    markAsRead(); // Mark them as read when the user opens the page
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/notifications", config);
      // FIXED: Changed setPosts to setNotifications
      setNotifications(res.data); 
    } catch (err) {
      console.log("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.put("http://localhost:8080/api/v1/notifications/mark-as-read", {}, config);
    } catch (err) {
      console.log("Error marking notifications as read", err);
    }
  };

  const getNotiDetails = (type) => {
    switch (type) {
      case 'like': return { icon: <Heart className="text-red-500" size={18} fill="currentColor" />, text: "liked your post" };
      case 'follow_request': return { icon: <UserPlus className="text-blue-500" size={18} />, text: "sent you a follow request" };
      case 'comment': return { icon: <MessageCircle className="text-green-500" size={18} />, text: "commented on your post" };
      case 'accept_follow': return { icon: <CheckCircle2 className="text-indigo-500" size={18} />, text: "accepted your follow request" };
      default: return { icon: <Bell className="text-gray-400" size={18} />, text: "interacted with you" };
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Bell className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h1>
              <p className="text-gray-400 text-sm font-medium">Stay updated with your circle</p>
            </div>
          </div>
          <button 
            onClick={markAsRead}
            className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-20 animate-pulse font-bold text-gray-400">Checking for updates...</div>
          ) : notifications.length > 0 ? (
            notifications.map((noti) => {
              const { icon, text } = getNotiDetails(noti.type);
              return (
                <div 
                  key={noti._id} 
                  className={`group flex items-center justify-between p-4 rounded-[2rem] border transition-all cursor-pointer ${
                    noti.read ? 'bg-white border-transparent' : 'bg-indigo-50/30 border-indigo-100 shadow-sm'
                  } hover:shadow-md hover:border-indigo-200`}
                >
                  <div className="flex items-center gap-4">
                    {/* User Avatar */}
                    <div className="relative">
                      <img 
                        src={noti.senderId?.profilePicture || "https://via.placeholder.com/150"} 
                        className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                        alt="user"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg shadow-sm">
                        {icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <p className="text-sm text-gray-800 leading-tight">
                        <span className="font-black text-gray-900">
                            {noti.senderId?.firstName} {noti.senderId?.lastName}
                        </span> 
                        {" "}{text}
                        {noti.commentText && <span className="text-gray-500 italic">: "{noti.commentText.substring(0, 20)}..."</span>}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">
                        {formatDistanceToNow(new Date(noti.createdAt))} ago
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            })
          ) : (
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="text-gray-300" size={30} />
              </div>
              <p className="text-gray-400 font-bold">No notifications yet</p>
              <p className="text-gray-300 text-xs mt-1">When someone interacts with you, it'll show up here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;