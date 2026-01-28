import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Search, MoreVertical, MessageSquare, X, Phone, Video, Trash2, Download, ShieldAlert } from 'lucide-react';
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

  // --- Helper to get real-time status ---
  const getStatus = (user) => {
    if (!user) return "";
    const isOnline = activeUsers.some((u) => u.userId === (user.userId || user._id));
    if (isOnline) return "Active Now";
    if (user.lastSeen) return `Last seen ${format(user.lastSeen)}`;
    return "Offline";
  };

  // --- Export Chat Logic ---
  const handleExportChat = () => {
    if (messages.length === 0) return alert("no message to export!");
    const chatContent = messages.map(m => {
      const name = m.senderId === currentUser?._id ? "Me" : selectedUser.username;
      return `[${format(m.createdAt)}] ${name}: ${m.text}`;
    }).join('\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_with_${selectedUser.username}.txt`;
    link.click();
    setShowMenu(false);
  };

  const handleBlockUser = () => {
    if (window.confirm(`do you really want to block ${selectedUser.username} ?`)) {
      setShowMenu(false);
    }
  };

  // Socket & Fetch Effects
  useEffect(() => {
    socket.current = io("http://localhost:8080");
    socket.current.emit("new-user-add", currentUser?._id);
    socket.current.on("get-users", (users) => setActiveUsers(users));
    return () => socket.current.disconnect();
  }, [currentUser?._id]);

  useEffect(() => {
    if (!socket.current) return;
    const handleReceive = (data) => {
      if (data.senderId === selectedUser?.userId) {
        setMessages((prev) => [...prev, data]);
      }
    };
    socket.current.on("receive-message", handleReceive);
    return () => socket.current.off("receive-message", handleReceive);
  }, [selectedUser]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/users/chat-list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMutualFriends(res.data);
      } catch (err) { console.error(err); }
    };
    if (currentUser?._id) fetchFriends();
  }, [currentUser?._id, token]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedUser) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/messages/${currentUser._id}/${selectedUser.userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) { setMessages([]); }
    };
    fetchChatHistory();
  }, [selectedUser, currentUser?._id, token]);

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
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
    try {
      await axios.post("http://localhost:8080/api/v1/messages/send", messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) { console.log(err); }
  };

  const handleClearChat = async () => {
    if (window.confirm("Bhai, puri chat clear karni hai?")) {
      try {
        await axios.put(`http://localhost:8080/api/v1/messages/clear/${currentUser._id}/${selectedUser.userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages([]);
        setShowMenu(false);
      } catch (err) { console.error(err); }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

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
              className="w-full bg-gray-50 rounded-xl py-2.5 pl-10 pr-4 outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all shadow-inner text-sm font-medium"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide">
          {mutualFriends
            .filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((friend) => {
              const isOnline = activeUsers.some((user) => user.userId === friend._id);
              const isSelected = selectedUser?.userId === friend._id;
              return (
                <div 
                  key={friend._id}
                  onClick={() => setSelectedUser({ userId: friend._id, username: friend.username, lastSeen: friend.lastSeen })}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer mb-1 transition-all group ${isSelected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "hover:bg-gray-100"}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold uppercase ${isSelected ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600"}`}>
                      {friend.username.charAt(0)}
                    </div>
                    {isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>}
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="font-bold text-sm truncate">{friend.username}</p>
                    <p className={`text-[11px] truncate ${isSelected ? "text-indigo-100" : isOnline ? "text-green-500 font-semibold" : "text-gray-400"}`}>
                      {isOnline ? "Online" : friend.lastSeen ? `Last seen ${format(friend.lastSeen)}` : "Offline"}
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
            <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-20">
              <div className="flex items-center gap-3 text-left">
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 sm:hidden"><X size={20} /></button>
                <div className="relative">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold uppercase shadow-inner">
                    {selectedUser.username.charAt(0)}
                  </div>
                  {activeUsers.some(u => u.userId === selectedUser.userId) && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-none">{selectedUser.username}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${activeUsers.some(u => u.userId === selectedUser.userId) ? "text-green-500" : "text-gray-400"}`}>
                    {getStatus(selectedUser)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button title="Voice Call" className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-90"><Phone size={20} /></button>
                <button title="Video Call" className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-all active:scale-90"><Video size={20} /></button>
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical className="text-gray-400" size={20} /></button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-150">
                      <button onClick={handleExportChat} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><Download size={16} className="text-gray-400" /> Export Chat</button>
                      <button onClick={handleBlockUser} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3"><ShieldAlert size={16} className="text-gray-400" /> Block User</button>
                      <div className="my-1 border-t border-gray-50"></div>
                      <button onClick={handleClearChat} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 font-semibold"><Trash2 size={16} /> Clear Chat</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/30">
              {messages.map((m, i) => {
                const isMe = m.senderId === currentUser?._id;
                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-2 rounded-2xl text-[13.5px] shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"}`}>
                      <p className="leading-relaxed whitespace-pre-wrap break-words">{m.text}</p>
                      <span className={`text-[9px] mt-1 block opacity-60 text-right ${isMe ? "text-indigo-100" : "text-gray-400"}`}>{format(m.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 sm:p-5 border-t flex gap-3 bg-white">
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Aa..." className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all shadow-inner" />
              <button type="submit" disabled={!newMessage.trim()} className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"><Send size={18} /></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/30">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 transform rotate-12"><MessageSquare size={40} className="text-indigo-500" /></div>
            <p className="text-xl font-black text-gray-800">Your Inbox</p>
            <p className="text-sm text-gray-400 mt-1 font-medium">Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;