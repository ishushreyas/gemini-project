import { useState } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';

function App() {
  // State to handle form input and submission status
  const [formData, setFormData] = useState({ q: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState(''); // State for response message

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.q.trim() !== '') {
      setMessages([...messages, { role: 'user', content: formData.q }]);
      setFormData({ q: '' }); // Clear input field after submitting

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
        setMessages((prev) => ([...prev, { role: 'bot', content: partsMessage }]));
        console.log('Form response:', partsMessage);
      } catch (error) {
        setMessage((prev) => ([...prev, { role: 'bot', content: 'There was an error submitting the form.'}]));
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <div className="card">
        <h2>Gemini</h2>
      <ul className="res">
        {messages.map((message, index) => (
          <li key={index}>
            <strong>{message.role}:</strong> <ReactMarkdown>{message.content}</ReactMarkdown>
          </li>
        ))}
      </ul>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Message:</label>
            <textarea
              type="text"
              id="name"
              name="q"
              value={formData.q}
              onChange={handleChange}
              required></textarea>
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </div>
    </>
  );
}
export default App;
