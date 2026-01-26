import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Search, MoreVertical, MessageSquare } from 'lucide-react';
import { format } from 'timeago.js';
import axios from 'axios';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const socket = useRef();
  const scrollRef = useRef();
  
  const currentUser = JSON.parse(localStorage.getItem("profile"));
  const token = localStorage.getItem("token");


  // friend fetch
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



  // chat history
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


  // socket connection
  useEffect(() => {
    socket.current = io("http://localhost:8080");
    socket.current.emit("new-user-add", currentUser?._id);


    return () => socket.current.disconnect();
  }, [currentUser?._id]);


// message recieve
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


//message sending
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
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* --- Sidebar: Friends List --- */}
      <div className="w-80 bg-white border-r flex flex-col shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-black text-gray-800 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              placeholder="Search friends..." 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 rounded-xl py-2 pl-10 pr-4 outline-none border border-transparent focus:border-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          {mutualFriends
            .filter(f => f.username.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((friend) => (
              <div 
                key={friend._id}
                onClick={() => setSelectedUser({ userId: friend._id, username: friend.username })}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer mb-1 transition-all ${selectedUser?.userId === friend._id ? "bg-indigo-50 shadow-sm" : "hover:bg-gray-50"}`}
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold uppercase">
                  {friend.username.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">{friend.username}</p>
                  <p className="text-xs text-gray-400 truncate">Tap to chat</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* --- Main Chat Box --- */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            <div className="p-5 border-b flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold uppercase">
                  {selectedUser.username.charAt(0)}
                </div>
                <h3 className="font-bold text-gray-800">{selectedUser.username}</h3>
              </div>
              <MoreVertical className="text-gray-400 cursor-pointer" size={20} />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderId === currentUser?._id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.senderId === currentUser?._id 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm"
                  }`}>
                    <p>{m.text}</p>
                    <span className="text-[10px] mt-1 block opacity-60 text-right">{format(m.createdAt)}</span>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSend} className="p-5 border-t flex gap-3 bg-white">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 bg-gray-100 rounded-2xl px-5 py-3 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 text-white p-3 rounded-2xl shadow-md hover:bg-indigo-700">
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={50} className="mb-4 opacity-10" />
            <p className="text-lg font-medium">Your Inbox</p>
            <p className="text-sm">Select a friend to start a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;