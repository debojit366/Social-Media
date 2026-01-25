import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format } from 'timeago.js'; // Time dikhane ke liye: npm i timeago.js
import { Send } from 'lucide-react';

const ChatBox = ({ chatUser, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef();

  // --- 1. Purani Chats Fetch Karna ---
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Maan lo aapka endpoint ye hai: /api/messages/:senderId/:receiverId
        const { data } = await axios.get(`http://localhost:5000/api/v1/posts/messages/${currentUser._id}/${chatUser._id}`);
        setMessages(data);
      } catch (err) {
        console.log("Purani chats load nahi ho payi:", err);
      }
    };

    if (chatUser) fetchMessages();
  }, [chatUser]); // Jab bhi friend badlega, naye messages load honge

  // --- 2. Real-time Message Receive Karna ---
  useEffect(() => {
    if (socket.current) {
      socket.current.on("receive-message", (data) => {
        // Check karo ki message usi bande se hai jisse abhi baat ho rahi hai
        if (data.senderId === chatUser._id) {
          setMessages((prev) => [...prev, data]);
        }
      });
    }
  }, [chatUser, socket]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageObj = {
      senderId: currentUser._id,
      receiverId: chatUser._id, // Friend ki ID yahan use ho rahi hai
      text: newMessage,
      createdAt: new Date()
    };

    // Socket ko bhej rahe hain (Real-time)
    socket.current.emit("send-message", messageObj);

    // Database mein save kar rahe hain (Permanent)
    try {
      await axios.post("http://localhost:5000/api/v1/posts/messages", messageObj);
      setMessages([...messages, messageObj]);
      setNewMessage("");
    } catch (err) {
      console.log("Message save nahi hua:", err);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white shadow-xl rounded-lg">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3 bg-indigo-600 text-white rounded-t-lg">
        <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center font-bold">
          {chatUser.username[0].toUpperCase()}
        </div>
        <span className="font-semibold text-lg">{chatUser.username}</span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((m, index) => (
          <div key={index} className={`flex ${m.senderId === currentUser._id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${m.senderId === currentUser._id ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-gray-800 border rounded-bl-none"}`}>
              <p className="text-sm">{m.text}</p>
              <span className="text-[10px] block mt-1 opacity-70">
                {format(m.createdAt)}
              </span>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t flex gap-2 bg-white rounded-b-lg">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Apna message likho..."
          className="flex-1 border-2 border-gray-200 rounded-full px-4 py-2 outline-none focus:border-indigo-500 transition-all"
        />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;