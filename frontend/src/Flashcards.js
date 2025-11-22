import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Flashcards.css";

export default function Flashcards() {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newSetDesc, setNewSetDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api";

  const loadSets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/flashcards/sets`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFlashcardSets(data || []);
      setLoading(false);
    } catch (err) {
      console.error("LoadSets Error:", err);
      setError("Failed to load flashcard sets.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  const createSet = async () => {
    if (!newSetTitle.trim()) {
      setError("Title is required.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/flashcards/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSetTitle, description: newSetDesc }),
      });
      const responseBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(responseBody.error || "Failed to create set.");
        return;
      }
      setNewSetTitle("");
      setNewSetDesc("");
      setError("");
      loadSets();
    } catch (err) {
      console.error("CreateSet Error:", err);
      setError("Network error.");
    }
  };

  const deleteSet = async (id, e) => {
    e.stopPropagation(); // Prevent Link navigation
    if (!window.confirm("Are you sure you want to delete this set?")) return;
    try {
      const res = await fetch(`${API_URL}/flashcards/sets/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFlashcardSets(flashcardSets.filter((set) => set.id !== id));
      } else {
        alert("Failed to delete set.");
      }
    } catch (err) {
      console.error("DeleteSet Error:", err);
      alert("Network error while deleting set.");
    }
  };

  return (
    <div className="flashcards-container">
      <h2 className="page-title">Your Flashcard Sets</h2>
      {error && <p className="error-text">{error}</p>}

      {/* Create Set */}
      <div className="create-box">
        <h3>Create New Flashcard Set</h3>
        <input
          type="text"
          placeholder="Set Title"
          value={newSetTitle}
          onChange={(e) => setNewSetTitle(e.target.value)}
          className="input-field"
        />
        <textarea
          placeholder="Description (optional)"
          value={newSetDesc}
          onChange={(e) => setNewSetDesc(e.target.value)}
          className="textarea-field"
        />
        <button className="btn-primary" onClick={createSet}>
          Create Set
        </button>
      </div>

      {/* List of Sets */}
      {loading ? (
        <p>Loading...</p>
      ) : flashcardSets.length === 0 ? (
        <p>No flashcard sets found.</p>
      ) : (
        <div className="sets-grid">
          {flashcardSets.map((set) => (
            <div key={set.id} className="set-item">
              <Link to={`/flashcards/${set.id}`} className="set-link">
                <h4>{set.title}</h4>
                <p>{set.description}</p>
              </Link>
              <button
                className="btn-delete"
                onClick={(e) => deleteSet(set.id, e)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
