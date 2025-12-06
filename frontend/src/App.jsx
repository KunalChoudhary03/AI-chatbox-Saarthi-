import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([
    {
      id: Date.now(),
      text: 'Hello! I am Saarthi, how can I help you?',
      sender: 'bot'
    }
  ]);

  const messagesEndRef = useRef(null);

  // -----------------------------~`
  // Handle message submit
  // -----------------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user"
    };

    setConversations(prev => [...prev, userMessage]);

    if (socket) {
      socket.emit("ai-message", message);
    }

    setMessage('');
  };

  // -----------------------------
  // Initialize socket connection
  // -----------------------------
  useEffect(() => {
    // Use Vite env var `VITE_SOCKET_URL` or fall back to localhost for local dev
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
    console.log("Connecting socket to:", SOCKET_URL);
    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to server", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
    });

    socketInstance.on("ai-message-response", (response) => {
      const botMessage = {
        id: Date.now(),
        text: response,
        sender: "bot"
      };
      setConversations(prev => [...prev, botMessage]);
    });


    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // -----------------------------
  // Auto-scroll to latest message
  // -----------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Saarthi.AI</h2>
      </div>
      
      <div className="messages-container">
        {conversations.map((msg) => (
          <div 
            key={msg.id}
            className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <span className="message-sender">
              {msg.sender === 'user' ? 'You' : 'Saarthi'}:
            </span> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!message.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
