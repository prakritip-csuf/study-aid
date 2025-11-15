import React, { useEffect, useState } from 'react';
import Flashcard from './Flashcard';
import './Flashcards.css';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Flashcards() {
  const { isLoggedIn, requireLogin } = useAuth();

  const [cards, setCards] = useState([]);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch flashcards from backend on component mount
  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/api/flashcards`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCards(data);
    } catch (err) {
      setError(`Failed to load flashcards: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addCard() {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    const q = newQ.trim();
    const a = newA.trim();
    if (!q && !a) return;

    try {
      setError('');
      const res = await fetch(`${API_URL}/api/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, answer: a, tags: [] })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newCard = await res.json();
      setCards(prev => [newCard, ...prev]);
      setNewQ('');
      setNewA('');
    } catch (err) {
      setError(`Failed to add card: ${err.message}`);
      console.error(err);
    }
  }

  async function updateCard(updated) {
    try {
      setError('');
      const res = await fetch(`${API_URL}/api/flashcards/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: updated.question,
          answer: updated.answer,
          tags: updated.tags || []
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updatedCard = await res.json();
      setCards(prev => prev.map(c => (c.id === updated.id ? updatedCard : c)));
    } catch (err) {
      setError(`Failed to update card: ${err.message}`);
      console.error(err);
    }
  }

  async function deleteCard(id) {
    try {
      setError('');
      const res = await fetch(`${API_URL}/api/flashcards/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCards(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(`Failed to delete card: ${err.message}`);
      console.error(err);
    }
  }

  return (
    <div className="flashcards-root container my-4">
      <h2>Flashcards</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="flashcard-new mb-3">
        <input
          className="form-control mb-2"
          placeholder="Enter question"
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
          disabled={loading}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Enter answer"
          value={newA}
          onChange={(e) => setNewA(e.target.value)}
          disabled={loading}
        />
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={addCard} disabled={loading}>
            {loading ? 'Adding...' : 'Add Card'}
          </button>
          <button className="btn btn-outline-secondary" onClick={() => { setNewQ(''); setNewA(''); }} disabled={loading}>Clear</button>
          <button className="btn btn-outline-info" onClick={fetchCards} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div className="flashcards-grid">
        {loading && cards.length === 0 && <p className="text-muted">Loading flashcards...</p>}
        {!loading && cards.length === 0 && <p className="text-muted">No flashcards yet — add one above.</p>}
        {cards.map(card => (
          <Flashcard key={card.id} card={card} onUpdate={updateCard} onDelete={deleteCard} />
        ))}
      </div>
    </div>
  );
}

export default Flashcards;
