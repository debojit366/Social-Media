import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, User, Search, MoreVertical, MessageSquare } from 'lucide-react';
import { format } from 'timeago.js';
import axios from 'axios';

const Messages = () => {
  // --- States ---
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const socket = useRef();
  const scrollRef = useRef();
  
  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(
        `http://localhost:8080/api/v1/users/chat-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
        setMutualFriends(res.data);
      } catch (err) {
        console.error("Friends fetch karne mein error:", err);
      }
    };
    if (currentUser?._id) fetchFriends();
  }, [currentUser?._id]);

  useEffect(() => {
    socket.current = io("http://localhost:8080");
    
    socket.current.emit("new-user-add", currentUser?._id);

    socket.current.on("get-users", (users) => {
      setActiveUsers(users.filter(user => user.userId !== currentUser?._id));
    });

    return () => socket.current.disconnect();
  }, [currentUser]);

  useEffect(() => {
    socket.current.on("receive-message", (data) => {
      if (data.senderId === selectedUser?.userId) {
        setMessages((prev) => [...prev, data]);
      }
    });
  }, [selectedUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      senderId: currentUser?._id,
      text: newMessage,
      receiverId: selectedUser.userId,
      createdAt: new Date()
    };

    socket.current.emit("send-message", messageData);
    
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
  };

  const filteredFriends = mutualFriends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* --- Sidebar: Mutual Friends List --- */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-50">
          <h1 className="text-2xl font-black text-gray-800 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search friends..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => {
              const isOnline = activeUsers.some((u) => u.userId === friend._id);

              return (
                <div 
                  key={friend._id}
                  onClick={() => {
                    setSelectedUser({ userId: friend._id, username: friend.username });
                    setMessages([]);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedUser?.userId === friend._id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold uppercase">
                      {friend.username.charAt(0)}
                    </div>
                    {/* Online indicator */}
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-gray-800 truncate">{friend.username}</p>
                    <p className={`text-xs truncate ${isOnline ? "text-green-500 font-medium" : "text-gray-400"}`}>
                      {isOnline ? "Online Now" : "Offline"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center mt-10 text-gray-400 text-sm">No mutual friends found</div>
          )}
        </div>
      </div>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold uppercase text-sm">
                  {selectedUser.username.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-none mb-1">{selectedUser.username}</h3>
                  <span className="text-[10px] text-green-500 font-semibold uppercase tracking-wider">Active Chat</span>
                </div>
              </div>
              <MoreVertical className="text-gray-400 cursor-pointer" size={20} />
            </div>

            {/* Messages Display */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  ref={scrollRef}
                  className={`flex ${m.senderId === currentUser?._id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                    m.senderId === currentUser?._id 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                  }`}>
                    <p>{m.text}</p>
                    <span className={`text-[10px] mt-1 block opacity-60 ${m.senderId === currentUser?._id ? "text-right" : "text-left"}`}>
                      {format(m.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="p-5 border-t border-gray-100 flex gap-3 bg-white">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
              />
              <button type="submit" className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-100">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/20">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4">
              <MessageSquare size={40} className="text-indigo-200" />
            </div>
            <h2 className="text-lg font-bold text-gray-700">Your Messages</h2>
            <p className="text-sm max-w-[200px] text-center">Select a mutual friend from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;