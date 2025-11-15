import React, { useEffect, useState } from 'react';
import Flashcard from './Flashcard';
import './Flashcards.css';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'study-aid:flashcards:v1';

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function Flashcards() {
  const { isLoggedIn, requireLogin } = useAuth();

  const [cards, setCards] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      // ignore
    }
  }, [cards]);

  function addCard() {
    // Require login before allowing creation
    if (!isLoggedIn) {
      requireLogin();
      return;
    }

    const q = newQ.trim();
    const a = newA.trim();
    if (!q && !a) return;
    const card = { id: genId(), question: q, answer: a };
    setCards(prev => [card, ...prev]);
    setNewQ('');
    setNewA('');
  }

  function updateCard(updated) {
    setCards(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  }

  function deleteCard(id) {
    setCards(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="flashcards-root container my-4">
      <h2>Flashcards</h2>

      <div className="flashcard-new mb-3">
        <input
          className="form-control mb-2"
          placeholder="Enter question"
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Enter answer"
          value={newA}
          onChange={(e) => setNewA(e.target.value)}
        />
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={addCard}>Add Card</button>
          <button className="btn btn-outline-secondary" onClick={() => { setNewQ(''); setNewA(''); }}>Clear</button>
        </div>
      </div>

      <div className="flashcards-grid">
        {cards.length === 0 && <p className="text-muted">No flashcards yet — add one above.</p>}
        {cards.map(card => (
          <Flashcard key={card.id} card={card} onUpdate={updateCard} onDelete={deleteCard} />
        ))}
      </div>
    </div>
  );
}

export default Flashcards;
