import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ReactMarkdown from 'react-markdown';

function App() {
  // State to handle form input and submission status
  const [formData, setFormData] = useState({ q: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

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

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: formData.q }), // Ensure you are sending the data as JSON
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    const partsMessage = result.response.Candidates[0].Content.Parts[0];
    setResponseMessage(partsMessage);
    console.log('Form response:', partsMessage);
  } catch (error) {
    setResponseMessage('There was an error submitting the form.');
    console.error('Form submission error:', error);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <h2>Gemini</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Message:</label>
            <input
              type="text"
              id="name"
              name="q"
              value={formData.q}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
        {responseMessage && (
            <ReactMarkdown>{responseMessage}</ReactMarkdown>
          )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
