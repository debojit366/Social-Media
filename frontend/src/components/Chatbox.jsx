import React, { useEffect, useState, useRef } from 'react';
import { Send, MoreVertical, Smile } from 'lucide-react';
import { format } from 'timeago.js';
import axios from 'axios';

const ChatBox = ({ chatUser, currentUser, socket, setMessages, messages }) => {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("profile"))?.token;
        const res = await axios.get(
          `http://localhost:8080/api/v1/messages/${currentUser._id}/${chatUser.userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data);
      } catch (err) {
        console.log("Chat history load nahi hui", err);
      }
    };

    if (chatUser) fetchHistory();
  }, [chatUser, currentUser._id]);

  // 2. Auto Scroll to Bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Message Bhejna
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      senderId: currentUser._id,
      receiverId: chatUser.userId,
      text: newMessage,
      createdAt: new Date()
    };

    socket.current.emit("send-message", msgData);
    setMessages([...messages, msgData]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
            {chatUser.username.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-bold text-gray-800">{chatUser.username}</h3>
        </div>
        <MoreVertical className="text-gray-400 cursor-pointer" size={20} />
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
        {messages.map((m, i) => (
          <div key={i} ref={scrollRef} className={`flex ${m.senderId === currentUser._id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
              m.senderId === currentUser._id ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border text-gray-700 rounded-tl-none"
            }`}>
              <p className="text-sm">{m.text}</p>
              <span className="text-[10px] opacity-60 block mt-1">{format(m.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t flex gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Apna sandesh likhein..."
          className="flex-1 bg-gray-100 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;