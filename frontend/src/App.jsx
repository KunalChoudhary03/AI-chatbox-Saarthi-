import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([
    {
      id: 1,
      text: 'Hello! I am Saarthi how can i help you?',
      sender: 'bot'
    }
  ]);

  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setConversations(prev => [...prev, { text: message, sender: 'user' }]);
      if (socket) {
        socket.emit("ai-message", message);
      }
      setMessage('');
    }
  };

  useEffect(() => {
    let socketInstance = io("https://ai-chatbox-saarthi.onrender.com");
    setSocket(socketInstance);

    socketInstance.on("ai-message-response", (response) => {
      const botMessage = {
        text: response,
        sender: "bot",
      };
      setConversations((prev) => [...prev, botMessage]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Saarthi.AI</h2>
      </div>
      
      <div className="messages-container">
        {conversations.map((msg, index) => (
          <div 
            key={index} 
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
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
