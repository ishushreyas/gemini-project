import React, { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const App = () => {
  const [formData, setFormData] = useState({ q: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.q.trim() !== '') {
      setMessages([...messages, { role: 'user', content: formData.q }]);
      setFormData({ q: '' });

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: formData.q }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        const partsMessage = result.response.Candidates[0].Content.Parts[0];
        setMessages(prev => [...prev, { role: 'bot', content: partsMessage }]);
      } catch (error) {
        setMessages(prev => [...prev, { role: 'bot', content: 'There was an error submitting the form.' }]);
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/30 rounded-3xl shadow-xl p-6 md:p-8">
        <h1 className="text-4xl font-bold text-purple-900 mb-8 flex items-center gap-3">
          <Bot className="w-10 h-10" />
          Gemini Chat
        </h1>

        <div className="space-y-6 mb-8 max-h-[60vh] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white rounded-3xl rounded-tr-lg'
                    : 'bg-white/50 rounded-3xl rounded-tl-lg'
                } p-4 shadow-lg`}
              >
                {message.role === 'user' ? (
                  <User className="w-6 h-6 shrink-0" />
                ) : (
                  <Bot className="w-6 h-6 shrink-0" />
                )}
                <div className="prose prose-lg">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <textarea
            className="w-full bg-white/50 backdrop-blur-xl rounded-2xl px-4 py-4 pr-12 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
            placeholder="Type your message..."
            name="q"
            value={formData.q}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="absolute right-4 bottom-4 text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
