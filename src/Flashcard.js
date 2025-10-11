import React, { useState } from 'react';
import './Flashcards.css';

function Flashcard({ card, onUpdate, onDelete }) {
  const [flipped, setFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);

  function saveEdit() {
    onUpdate({ ...card, question: question.trim(), answer: answer.trim() });
    setIsEditing(false);
  }

  return (
    <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
      <div
        className="flashcard-inner"
        onClick={() => !isEditing && setFlipped(prev => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !isEditing && setFlipped(prev => !prev);
          }
        }}
      >
        {!isEditing ? (
          <>
            <div className="flashcard-front">
              <div className="flashcard-text">{card.question || <em>(No question)</em>}</div>
            </div>
            <div className="flashcard-back">
              <div className="flashcard-text">{card.answer || <em>(No answer)</em>}</div>
            </div>
          </>
        ) : (
          <div className="flashcard-edit">
            <input
              className="flashcard-input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Question"
            />
            <textarea
              className="flashcard-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer"
            />
            <div className="flashcard-edit-actions">
              <button onClick={saveEdit} className="btn btn-primary">Save</button>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="flashcard-controls">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(card.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default Flashcard;
