import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('sessionId', id);
    }
    setSessionId(id);
    fetchHistory(id);
  }, []);

  const fetchHistory = async (id) => {
    try {
      const res = await axios.get(`https://backend-1-1p8a.onrender.com/api/chat/history/${id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', message: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('https://backend-1-1p8a.onrender.com/api/chat', {
        sessionId,
        message: input
      });
      setMessages([...newMessages, { role: 'bot', message: res.data.answer }]);
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = async () => {
    try {
      await axios.post(`https://backend-1-1p8a.onrender.com/api/chat/reset/${sessionId}`);
      const newId = uuidv4();
      localStorage.setItem('sessionId', newId);
      setSessionId(newId);
      setMessages([]);
    } catch (err) {
      console.error('Failed to reset session', err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-2xl p-6 flex flex-col h-[95vh]">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">News Chatbot</h1>
          <button
            onClick={resetSession}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Reset
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl max-w-xs ${
                msg.role === 'user'
                  ? 'bg-blue-100 self-end text-right'
                  : 'bg-gray-200 self-start'
              }`}
            >
              {msg.message}
            </div>
          ))}
          {loading && (
            <div className="text-gray-400 italic">Bot is typing...</div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="flex items-center">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask something..."
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;