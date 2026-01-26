import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Search, MoreVertical, MessageSquare, X, Phone, Video, Trash2 } from 'lucide-react';
import { format } from 'timeago.js';
import axios from 'axios';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  const socket = useRef();
  const scrollRef = useRef();
  const menuRef = useRef(); 

  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  // 1. Fetch Chat List (Friends)
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
  }, [currentUser?._id, token]);

  // 2. Fetch Chat History
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
  }, [selectedUser, currentUser?._id, token]);

  // 3. Socket Connection & Online Users
  useEffect(() => {
    socket.current = io("http://localhost:8080");
    socket.current.emit("new-user-add", currentUser?._id);
    socket.current.on("get-users", (users) => setActiveUsers(users));

    return () => socket.current.disconnect();
  }, [currentUser?._id]);

  // 4. Message Receiving Logic
  useEffect(() => {
    const handleReceive = (data) => {
      if (data.senderId === selectedUser?.userId) {
        setMessages((prev) => [...prev, data]);
      }
    };
    socket.current.on("receive-message", handleReceive);
    return () => socket.current.off("receive-message", handleReceive);
  }, [selectedUser]);

  // 5. Click Outside to Close Menu (Using useRef)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 6. Send Message Logic
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

  // 7. Clear Chat Logic
  const handleClearChat = async () => {
    if (window.confirm("Bhai, kya aap sach mein ye chat clear karna chahte ho?")) {
      try {
        await axios.put(`http://localhost:8080/api/v1/messages/clear/${currentUser._id}/${selectedUser.userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages([]);
        setShowMenu(false);
      } catch (err) {
        console.error("Clear chat error:", err);
      }
    }
  };

  // 8. Auto Scroll to Bottom
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
        
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {mutualFriends
            .filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((friend) => {
              const isOnline = activeUsers.some((user) => user.userId === friend._id);
              return (
                <div 
                  key={friend._id}
                  onClick={() => setSelectedUser({ userId: friend._id, username: friend.username })}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer mb-1 transition-all group ${
                    selectedUser?.userId === friend._id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "hover:bg-gray-100"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold uppercase transition-colors ${
                      selectedUser?.userId === friend._id ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600"
                    }`}>
                      {friend.username.charAt(0)}
                    </div>
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
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
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-20">
              <div className="flex items-center gap-3 text-left">
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 sm:hidden">
                  <X size={20} />
                </button>
                <div className="relative flex-shrink-0">
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

              {/* Dropdown Menu with useRef */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="text-gray-400" size={20} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-150">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3">
                      <Phone size={16} /> Voice Call
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3">
                      <Video size={16} /> Video Call
                    </button>
                    <div className="my-1 border-t border-gray-50"></div>
                    <button onClick={handleClearChat} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 font-medium">
                      <Trash2 size={16} /> Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderId === currentUser?._id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    m.senderId === currentUser?._id 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{m.text}</p>
                    <span className="text-[9px] mt-1 block opacity-60 text-right">
                      {format(m.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 sm:p-5 border-t flex gap-3 bg-white">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
              />
              <button type="submit" className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/30">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 border border-gray-50">
              <MessageSquare size={40} className="text-indigo-100" />
            </div>
            <p className="text-xl font-black text-gray-800">Your Inbox</p>
            <p className="text-sm text-gray-400 mt-1 font-medium px-10 text-center">Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;