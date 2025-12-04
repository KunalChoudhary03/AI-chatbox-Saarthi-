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
    const socketInstance = io("https://ai-chatbox-saarthi.onrender.com", {
      transports: ["websocket"],
      withCredentials: true
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to server");
    });

    socketInstance.on("ai-message-response", (response) => {
      const botMessage = {
        id: Date.now(),
        text: typeof response === "string" ? response : response?.text,
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
