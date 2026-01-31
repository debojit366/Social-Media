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
  const [unreadStats, setUnreadStats] = useState([]);

  const socket = useRef();
  const scrollRef = useRef();

  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");

  // Helper status function
  const getStatus = (user) => {
    if (!user) return "";
    const isOnline = activeUsers.some((u) => u.userId === (user.userId || user._id));
    if (isOnline) return "Active Now";
    if (user.lastSeen) return `Last seen ${format(user.lastSeen)}`;
    return "Offline";
  };

  // --- API: Fetch Unread Counts ---
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/messages/unread/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadStats(res.data);
    } catch (err) { console.error("Unread fetch error", err); }
  };

  // --- API: Mark as Read ---
  const markAsRead = async (chatPartnerId) => {
    try {
      await axios.put(`http://localhost:8080/api/v1/messages/read/${chatPartnerId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 1. Local sidebar refresh
      fetchUnreadCount(); 

      
      window.dispatchEvent(new Event("refreshUnreadCount"));

    } catch (err) { console.error("Mark read error", err); }
  };

  // Socket Setup
  useEffect(() => {
    socket.current = io("http://localhost:8080");
    socket.current.emit("new-user-add", currentUser?._id);
    socket.current.on("get-users", (users) => setActiveUsers(users));
    

    socket.current.on("receive-message", (data) => {
      fetchUnreadCount(); 
    });

    return () => socket.current.disconnect();
  }, [currentUser?._id]);


  useEffect(() => {
    if (!socket.current) return;
    const handleReceive = (data) => {

      if (data.senderId === selectedUser?.userId) {
        setMessages((prev) => [...prev, data]);
        markAsRead(selectedUser.userId);
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
        fetchUnreadCount();
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
        markAsRead(selectedUser.userId);
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

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex h-[calc(100vh-64px)] mt-[64px] bg-gray-50 overflow-hidden font-sans text-left">
      {/* --- SIDEBAR --- */}
      <div className={`w-full sm:w-80 bg-white border-r flex flex-col shadow-sm ${selectedUser ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Messages</h1>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <MessageSquare size={22} />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              placeholder="Search friends..." 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 rounded-xl py-2.5 pl-10 pr-4 outline-none border border-transparent focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-hide">
          {mutualFriends
            .filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((friend) => {
              const isOnline = activeUsers.some((u) => u.userId === friend._id);
              const isSelected = selectedUser?.userId === friend._id;
              const unread = unreadStats.find(s => s._id === friend._id);

              return (
                <div 
                  key={friend._id}
                  onClick={() => setSelectedUser({ userId: friend._id, username: friend.username, lastSeen: friend.lastSeen })}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer mb-1 transition-all group relative ${isSelected ? "bg-indigo-600 text-white shadow-lg" : "hover:bg-gray-100"}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold uppercase ${isSelected ? "bg-white/20" : "bg-indigo-100 text-indigo-600"}`}>
                      {friend.username.charAt(0)}
                    </div>
                    {isOnline && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm truncate">{friend.username}</p>
                    <p className={`text-[11px] truncate ${isSelected ? "text-indigo-100" : "text-gray-400"}`}>
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                  
                  {/* --- INDIVIDUAL UNREAD BADGE (100+ Logic) --- */}
                  {unread?.count > 0 && !isSelected && (
                    <div className="bg-red-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm">
                      {unread.count > 100 ? '100+' : unread.count}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* --- CHAT BOX --- */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedUser ? 'hidden sm:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm z-20">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 sm:hidden"><X size={20} /></button>
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold uppercase">
                  {selectedUser.username.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-none">{selectedUser.username}</h3>
                  <span className="text-[10px] text-green-500 font-bold uppercase">{getStatus(selectedUser)}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
              {messages.map((m, i) => {
                const isMe = m.senderId === currentUser?._id;
                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-[13.5px] ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border text-gray-700 rounded-tl-none"}`}>
                      <p className="leading-relaxed whitespace-pre-wrap break-words">{m.text}</p>
                      <span className="text-[9px] mt-1 block opacity-60 text-right">{format(m.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-3 bg-white">
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all" />
              <button type="submit" disabled={!newMessage.trim()} className="bg-indigo-600 text-white p-3.5 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50"><Send size={18} /></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <MessageSquare size={48} className="mb-4 text-indigo-200" />
            <p className="text-lg font-bold text-gray-400">Select a chat to start</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;