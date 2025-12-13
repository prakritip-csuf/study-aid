import React, { useEffect, useState } from "react";
import { FaTrash, FaTrashAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Flashcards.css";

export default function Flashcards() {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newSetDesc, setNewSetDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [genSuccess, setGenSuccess] = useState("");

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

  const generateFlashcards = async () => {
    setGenError("");
    setGenSuccess("");
    if (!topic.trim()) {
      setGenError("Please enter a topic to generate flashcards.");
      return;
    }

    setGenLoading(true);
    try {
      const payload = { topic: topic.trim(), count: Number(count), create_set: true, set_title: `AI: ${topic.trim()}` };
      const res = await fetch(`${API_URL}/flashcards/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGenError(body.error || `Error: ${res.status}`);
        setGenLoading(false);
        return;
      }

      setGenSuccess(`Generated ${Array.isArray(body) ? body.length : 0} flashcards.`);
      setTopic("");
      setCount(5);
      // refresh sets list to include the new set
      await loadSets();
    } catch (err) {
      console.error("Generate Error:", err);
      setGenError("Network error while generating flashcards.");
    } finally {
      setGenLoading(false);
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

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <button
          className={`tab-btn ${!showGenerator ? 'active' : ''}`}
          onClick={() => setShowGenerator(false)}
        >
          Create Sets
        </button>
        <button
          className={`tab-btn ${showGenerator ? 'active' : ''}`}
          onClick={() => setShowGenerator(true)}
          style={{ marginLeft: 8 }}
        >
          AI Generate
        </button>
      </div>

      {/* Create Set or AI Generator (tabbed) */}
      {!showGenerator ? (
        <div className="create-box">
          <h3>Create a New Flashcard Set</h3>
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
          <button className="btn-create" onClick={createSet}>
            Create Set
          </button>
        </div>
      ) : (
        <div className="create-box">
          <h3>Generate Flashcards with AI</h3>
          <input
            type="text"
            placeholder="Topic (e.g., Photosynthesis)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field"
            disabled={genLoading}
          />
          <input
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="input-field"
            disabled={genLoading}
            style={{ width: 120 }}
          />
          <div style={{ marginTop: 8 }}>
            <button className="btn-create" onClick={generateFlashcards} disabled={genLoading}>
              {genLoading ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
          {genError && <p className="error-text" style={{ marginTop: 8 }}>{genError}</p>}
          {genSuccess && <p className="success-text" style={{ marginTop: 8 }}>{genSuccess}</p>}
        </div>
      )}

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
                <FaTrashAlt />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
