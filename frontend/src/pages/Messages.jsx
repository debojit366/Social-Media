import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Search, MoreVertical, MessageSquare, X } from 'lucide-react';
import { format } from 'timeago.js';
import axios from 'axios';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUsers, setActiveUsers] = useState([]); // <-- 1. Online Users State

  const socket = useRef();
  const scrollRef = useRef();
  
  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  // Friend Fetch Logic
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/users/chat-list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMutualFriends(res.data);
      } catch (err) {
        console.error("Friends fetch error:", err);
      }
    };
    if (currentUser?._id) fetchFriends();
  }, []);

  // Chat History Logic
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedUser) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/messages/${currentUser._id}/${selectedUser.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.log("History load error:", err);
        setMessages([]);
      }
    };
    fetchChatHistory();
  }, [selectedUser]);

  // Socket Connection & Active Users Logic
  useEffect(() => {
    socket.current = io("http://localhost:8080");
    
    socket.current.emit("new-user-add", currentUser?._id);

    // Online users list
    socket.current.on("get-users", (users) => {
      setActiveUsers(users);
    });

    return () => socket.current.disconnect();
  }, [currentUser?._id]);

  // Message Receiving Logic
  useEffect(() => {
    const handleReceive = (data) => {
      if (data.senderId === selectedUser?.userId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.current.on("receive-message", handleReceive);

    return () => {
      socket.current.off("receive-message", handleReceive);
    };
  }, [selectedUser]);

  // Message Sending Logic
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      senderId: currentUser?._id,
      receiverId: selectedUser.userId,
      text: newMessage,
      createdAt: new Date()
    };

    socket.current.emit("send-message", messageData);

    try {
      await axios.post("http://localhost:8080/api/v1/messages/send", messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
    } catch (err) {
      console.log("DB save error:", err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-64px)] mt-[64px] bg-gray-50 overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <div className={`w-full sm:w-80 bg-white border-r flex flex-col shadow-sm ${selectedUser ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-black text-gray-800 mb-4 tracking-tight">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              placeholder="Search friends..." 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 rounded-xl py-2.5 pl-10 pr-4 outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all shadow-inner text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3">
          {mutualFriends
            .filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((friend) => {
              // 2. Check if this specific friend is online
              const isOnline = activeUsers.some((user) => user.userId === friend._id);
              
              return (
                <div 
                  key={friend._id}
                  onClick={() => setSelectedUser({ userId: friend._id, username: friend.username })}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer mb-1 transition-all group ${
                    selectedUser?.userId === friend._id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "hover:bg-gray-100"
                  }`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold uppercase transition-colors ${
                      selectedUser?.userId === friend._id ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600"
                    }`}>
                      {friend.username.charAt(0)}
                    </div>
                    {/* 3. Green Dot UI */}
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm truncate">{friend.username}</p>
                    <p className={`text-[11px] truncate ${selectedUser?.userId === friend._id ? "text-indigo-100" : isOnline ? "text-green-500 font-medium" : "text-gray-400"}`}>
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* --- MAIN CHAT BOX --- */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedUser ? 'hidden sm:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="relative">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold uppercase">
                    {selectedUser.username.charAt(0)}
                    </div>
                    {activeUsers.some(u => u.userId === selectedUser.userId) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-none">{selectedUser.username}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${activeUsers.some(u => u.userId === selectedUser.userId) ? "text-green-500" : "text-gray-400"}`}>
                    {activeUsers.some(u => u.userId === selectedUser.userId) ? "Active Now" : "Offline"}
                  </span>
                </div>
              </div>
              <MoreVertical className="text-gray-300 cursor-pointer" size={20} />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderId === currentUser?._id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    m.senderId === currentUser?._id 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                  }`}>
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[9px] mt-1 block opacity-60 text-right">{format(m.createdAt)}</span>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-5 border-t flex gap-3 bg-white">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button type="submit" className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/30">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
              <MessageSquare size={40} className="text-indigo-100" />
            </div>
            <p className="text-xl font-black text-gray-800">Your Inbox</p>
            <p className="text-sm text-gray-400 mt-1 font-medium">Select a friend to start a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;