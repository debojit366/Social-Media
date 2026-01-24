import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, User, Search, MoreVertical } from 'lucide-react';
import { format } from 'timeago.js';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const socket = useRef();
  const scrollRef = useRef();
  const currentUser = JSON.parse(localStorage.getItem("profile"));

  // 1. Connection & Setup
  useEffect(() => {
    socket.current = io("http://localhost:8080");
    socket.current.emit("new-user-add", currentUser?._id);

    socket.current.on("get-users", (users) => {
      // Khud ko list mein se hata kar baaki online users dikhana
      setActiveUsers(users.filter(user => user.userId !== currentUser?._id));
    });

    return () => socket.current.disconnect();
  }, [currentUser]);

  // 2. Message Receive Karna
  useEffect(() => {
    socket.current.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, []);

  // 3. Auto Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Message Bhejna
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: currentUser?._id,
      text: newMessage,
      receiverId: selectedUser?.userId,
      createdAt: new Date()
    };

    // Socket ko bhej rahe hain
    socket.current.emit("send-message", messageData);
    
    // Apni screen par add kar rahe hain
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar: Users List */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-50">
          <h1 className="text-2xl font-black text-gray-800 mb-4">Chats</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Search people..." 
              className="w-full bg-gray-50 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeUsers.map((user) => (
            <div 
              key={user.userId}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedUser?.userId === user.userId ? "bg-indigo-50" : "hover:bg-gray-50"}`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold uppercase">
                  {user.userId.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-800">User_{user.userId.slice(-4)}</p>
                <p className="text-xs text-green-500 font-medium">Online Now</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-white font-bold uppercase text-sm">
                  {selectedUser.userId.charAt(0)}
                </div>
                <h3 className="font-bold text-gray-800">User_{selectedUser.userId.slice(-4)}</h3>
              </div>
              <MoreVertical className="text-gray-400 cursor-pointer" size={20} />
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20">
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  ref={scrollRef}
                  className={`flex ${m.senderId === currentUser?._id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                    m.senderId === currentUser?._id 
                    ? "bg-indigo-600 text-white rounded-br-none" 
                    : "bg-white border border-gray-100 text-gray-700 rounded-bl-none"
                  }`}>
                    <p className="text-sm">{m.text}</p>
                    <span className={`text-[10px] mt-1 block opacity-60 ${m.senderId === currentUser?._id ? "text-right" : "text-left"}`}>
                      {format(m.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-5 border-t border-gray-100 flex gap-3">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write something..."
                className="flex-1 bg-gray-100 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button type="submit" className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-100">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-gray-200" />
            </div>
            <p className="text-sm font-medium">Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;