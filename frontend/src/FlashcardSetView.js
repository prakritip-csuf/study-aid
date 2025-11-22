import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './Flashcardset.css';

export default function FlashcardSetView() {
  const { id } = useParams();
  const [cards, setCards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flip, setFlip] = useState(false);

  const API_URL = "http://localhost:5000/api";

  const loadCards = async () => {
    try {
      const res = await fetch(`${API_URL}/flashcards/sets/${id}/cards`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCards(data || []);
    } catch (err) {
      setError("Failed to load flashcards.");
    }
  };

  useEffect(() => {
    if (id) loadCards();
  }, [id]);

  const addCard = async () => {
    if (!question.trim() || !answer.trim()) {
      setError("Both question and answer required.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/flashcards/sets/${id}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add flashcard.");
        return;
      }
      setQuestion("");
      setAnswer("");
      setError("");
      loadCards();
    } catch {
      setError("Network error while creating flashcard.");
    }
  };

  const deleteCard = async (cardId) => {
    await fetch(`${API_URL}/flashcards/cards/${cardId}`, { method: "DELETE" });
    loadCards();
  };

  const nextCard = () => {
    setFlip(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setFlip(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const updateCard = async (cardId, newQ, newA) => {
    try {
      const res = await fetch(`${API_URL}/flashcards/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ, answer: newA }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update card.");
        return;
      }
      loadCards();
    } catch (err) {
      setError("Network error while updating flashcard.");
    }
  };

  // Enhance the cards with local edit state
  const handleEditInit = (cardId) =>
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, editing: true, editQuestion: c.question, editAnswer: c.answer }
          : c
      )
    );

  const handleEditCancel = (cardId) =>
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, editing: false } : c
      )
    );

  const handleEditChange = (cardId, field, value) =>
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, [field]: value } : c
      )
    );

  const handleEditSave = async (card) => {
    await updateCard(card.id, card.editQuestion, card.editAnswer);
    setCards((prev) =>
      prev.map((c) =>
        c.id === card.id ? { ...c, editing: false } : c
      )
    );
  };

  return (
    <div className="flashcardset-container">
      <div className="left-panel">
        <h2 className="page-title">Flashcards in Set #{id}</h2>
        {error && <p className="error-text">{error}</p>}

        <div className="create-box">
          <h3>Create Flashcard</h3>
          <input
            type="text"
            placeholder="Term"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Definition"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="input-field"
          />
          <button className="btn-primary" onClick={addCard}>Add Flashcard</button>
        </div>

        <div className="card-list">
          {cards.map((card) => (
            <div key={card.id}
              className={`flashcard-container`}
              onClick={(e) => {
                if (!card.editing) e.currentTarget.classList.toggle("flipped");
              }}
            >
              {!card.editing ? (
                <>
                  <div className="flashcard">
                    <div className="flashcard-front">{card.question}</div>
                    <div className="flashcard-back">{card.answer}</div>
                  </div>
                  <div className="fc-card-actions">
                    <button
                      className="fc-btn-edit"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleEditInit(card.id);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="fc-btn-dlt"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        deleteCard(card.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="fc-edit-box">
                  <input
                    className="fc-edit-field"
                    value={card.editQuestion}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleEditChange(card.id, "editQuestion", e.target.value)
                    }
                  />
                  <input
                    className="fc-edit-field"
                    value={card.editAnswer}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleEditChange(card.id, "editAnswer", e.target.value)
                    }
                  />
                  <div className="fc-edit-actions">
                    <button
                      className="fc-btn-edit"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleEditSave(card);
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="fc-btn-delete"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleEditCancel(card.id);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="right-panel">
        <h3>Flashcard Slider</h3>
        {cards.length > 0 && (
          <div className="slider-container">
            <div
              className={`slider-card-container ${flip ? "flipped" : ""}`}
              onClick={() => setFlip(!flip)}
            >
              <div className="slider-card">
                <div className="slider-front">{cards[currentIndex].question}</div>
                <div className="slider-back">{cards[currentIndex].answer}</div>
              </div>
            </div>
            <div className="slider-controls">
              <button className="prev" onClick={prevCard}></button>
              <button className="next" onClick={nextCard}></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
