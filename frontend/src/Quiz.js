import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const STORAGE_KEY = 'study-aid:flashcards:v1';

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function Quiz() {
  const [flashcards, setFlashcards] = useState([]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loadingSets, setLoadingSets] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]); // user's selected answers per question
  const [results, setResults] = useState([]); // saved quiz attempts
  const [viewingResultIndex, setViewingResultIndex] = useState(null);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const API_URL = 'http://localhost:5000/api';
  const RESULTS_KEY = 'study-aid:quiz-results:v1';

  // Load available flashcard sets from backend and detect localStorage set
  useEffect(() => {
    let mounted = true;
    async function loadSets() {
      setLoadingSets(true);
      try {
        const res = await fetch(`${API_URL}/flashcards/sets`);
        const data = await res.json();
        if (!mounted) return;
        const list = Array.isArray(data) ? data : [];

        // If local storage has cards, add a special 'local' set option
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            list.unshift({ id: 'local', title: 'Local Flashcards (browser)' });
          }
        } catch (e) {
          // ignore
        }

        setSets(list);

        // Default selection: local if present, otherwise first backend set
        if (list.length > 0) {
          setSelectedSet(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load sets', err);
      } finally {
        if (mounted) setLoadingSets(false);
      }
    }
    loadSets();
    // load past results
    try {
      const raw = localStorage.getItem(RESULTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setResults(parsed);
    } catch (e) {
      // ignore
    }
    return () => { mounted = false; };
  }, []);

  // TEMPORARY: Random word bank for distractors until AI-generated options are implemented
  const WORD_BANK = [
    // Original words
    'Classes', 'Functions', 'Headers', 'Javascript', 'React', 'JSON', 'CSS', 'HTML', 'Flashcards', 'Website', 'Application', 'Dashboard', 'Frontend', 'Backend', 'Database', 'Login', 'Logout', 'Security',
    'Mild', 'Absent', 'Appear', 'Work', 'Familiar', 'Projection', 'Teach', 'Adoption', 'Salon', 'Smell', 'Dive', 'Drop', 'Evolution', 'Elapse', 'Pipe', 'Tired', 'Bill', 'Part', 'Rifle', 'Appetite', 'Courses',
    'Thesis', 'Hypothesis', 'Analysis', 'Syllabus', 'Curriculum', 'Lecture', 'Seminar', 'Research', 'Experiment', 'Theory', 'Citation', 'Bibliography', 'Abstract', 'Peer Review', 'Dissertation', 'Scholar', 
    'Publication', 'Assessment', 'Evaluation', 'Plagiarism', 'Methodology', 'Variable', 'Statistic', 'Data', 'Concept', 'Framework', 'Literature', 'Argument', 'Conclusion', 'Evidence','Algorithm', 'Array', 
    'Binary', 'Boolean', 'Cache', 'Class', 'Compiler', 'Data Structure', 'Encapsulation', 'Inheritance', 'Interface', 'Loop', 'Object', 'Pointer', 'Recursion','Stack', 'Queue', 'Tree', 'Graph', 'Hash', 
    'Protocol', 'Server', 'Client', 'Thread', 'Process', 'Virtualization', 'Cloud', 'API', 'Encryption', 'Decryption', 'Machine Learning', 'Artificial Intelligence', 'Network', 'Packet', 'Router', 'Switch', 
    'Firewall', 'Operating System', 'Kernel', 'Shell', 'Script', 'Quantum', 'Paradigm', 'Syntax', 'Compile', 'Debug', 'Module', 'Pixel', 'Bandwidth', 'Topology', 'Sophomore', 'Junior', 'Senior', 'Graduate', 
  ];

  // When selected set or flashcards change, load cards and prepare choices
  useEffect(() => {
    let mounted = true;
    async function loadCardsForSelectedSet() {
      if (!selectedSet) return;
      try {
        let cards = [];
        if (selectedSet === 'local') {
          const raw = localStorage.getItem(STORAGE_KEY);
          cards = raw ? JSON.parse(raw) : [];
        } else {
          const res = await fetch(`${API_URL}/flashcards/sets/${selectedSet}/cards`);
          if (res.ok) {
            cards = await res.json();
          } else {
            cards = [];
          }
        }
        if (!mounted) return;
        setFlashcards(cards);
        setShuffledQuestions(shuffle(cards));
        setCurrent(0);
      } catch (err) {
        console.error('Failed to load cards for set', err);
        if (mounted) {
          setFlashcards([]);
          setShuffledQuestions([]);
        }
      }
    }
    loadCardsForSelectedSet();
    return () => { mounted = false; };
  }, [selectedSet]);


  useEffect(() => {
    if (shuffledQuestions.length > 0 && current < shuffledQuestions.length) {
      const correct = shuffledQuestions[current].answer;
      // Gather possible incorrects from all flashcards (excluding correct)
      let flashcardIncorrects = flashcards.filter(c => c.answer !== correct).map(c => c.answer);
      // Gather possible incorrects from word bank (excluding correct)
      let wordBankIncorrects = WORD_BANK.filter(w => w !== correct);
      // Shuffle and pick up to 2 from flashcards, up to 2 from word bank
      let chosenFlashcardIncorrects = shuffle(flashcardIncorrects).slice(0, 2);
      let chosenWordBankIncorrects = shuffle(wordBankIncorrects).slice(0, 2);
      // Combine, remove duplicates, and ensure no correct answer
      let allIncorrects = shuffle([...chosenFlashcardIncorrects, ...chosenWordBankIncorrects])
        .filter((ans, idx, arr) => ans !== correct && arr.indexOf(ans) === idx);
      // If not enough, fill from word bank
      while (allIncorrects.length < 3) {
        let candidates = WORD_BANK.filter(w => w !== correct && !allIncorrects.includes(w));
        let word = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : '';
        allIncorrects.push(word);
      }
      // Final choices: correct + 3 incorrects
      const allChoices = shuffle([correct, ...allIncorrects.slice(0, 3)]);
      setChoices(allChoices);
      setSelected(null);
      // ensure answers array matches length
      setAnswers((prev) => {
        const next = prev ? prev.slice() : [];
        while (next.length < shuffledQuestions.length) next.push(null);
        return next;
      });
    }
  }, [shuffledQuestions, current, flashcards]);

  function handleSelect(choice) {
    setSelected(choice);
    setAnswers(prev => {
      const next = prev ? prev.slice() : [];
      next[current] = choice;
      return next;
    });
  }

  function handleNext() {
    if (selected === shuffledQuestions[current].answer) {
      setScore(s => s + 1);
    }
    if (current + 1 < shuffledQuestions.length) {
      setCurrent(c => c + 1);
    } else {
      // build result details and save
      const items = shuffledQuestions.map((q, idx) => ({
        question: q.question,
        correctAnswer: q.answer,
        selectedAnswer: answers[idx] ?? null,
        correct: (answers[idx] ?? null) === q.answer
      }));
      const total = shuffledQuestions.length;
      const finalScore = items.reduce((acc, it) => acc + (it.correct ? 1 : 0), 0);
      const result = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        setId: selectedSet,
        setTitle: sets.find(s => s.id === selectedSet)?.title || (selectedSet === 'local' ? 'Local Flashcards' : ''),
        score: finalScore,
        total,
        items,
      };
      const nextResults = [result, ...results];
      setResults(nextResults);
      try {
        localStorage.setItem(RESULTS_KEY, JSON.stringify(nextResults));
      } catch (e) {
        // ignore
      }
      setScore(finalScore);
      setShowResult(true);
    }
  }

  if (shuffledQuestions.length === 0) {
    return (
      <div className="container my-4">
        <h2>Quiz</h2>
        <p className="text-muted">No flashcards found. Please add some flashcards first.</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="container my-4">
        <h2>Quiz Complete!</h2>
        <p>Your score: {score} / {shuffledQuestions.length}</p>
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-primary" onClick={() => {
            setShuffledQuestions(shuffle(flashcards));
            setCurrent(0);
            setScore(0);
            setAnswers([]);
            setViewingResultIndex(null);
            setShowResult(false);
          }}>Restart Quiz</button>
        </div>
        {/* Past Results list for this set */}
        <div className="results-list mb-3">
          <h4>Past Attempts ({results.filter(r => r.setId === selectedSet).length})</h4>
          <p>Best score: {(() => {
            const setResults = results.filter(r => r.setId === selectedSet);
            if (setResults.length === 0) return '-';
            return Math.max(...setResults.map(r => r.score)) + ' / ' + (setResults[0].total || '-');
          })()}</p>
          <ul className="list-group">
            {results.filter(r => r.setId === selectedSet).map((r, idx) => (
              <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{new Date(r.timestamp).toLocaleString()}</strong>
                  <div>{r.score} / {r.total}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setViewingResultIndex(idx)}>View</button>
                </div>
              </li>
            ))}
          </ul>
          {/* Show result details when a past attempt is selected */}
          {viewingResultIndex !== null && (() => {
            const setResults = results.filter(r => r.setId === selectedSet);
            const r = setResults[viewingResultIndex];
            if (!r) return null;
            return (
              <div className="past-result mb-3 mt-3">
                <h4>Attempt details</h4>
                <p><strong>{new Date(r.timestamp).toLocaleString()}</strong> — {r.score} / {r.total}</p>
                <ul className="list-group">
                  {r.items.map((it, i) => (
                    <li key={i} className={`list-group-item ${it.correct ? 'list-group-item-success' : 'list-group-item-danger'}`}>
                      <div><strong>Q:</strong> {it.question}</div>
                      <div><strong>Your answer:</strong> {it.selectedAnswer ?? '(no answer)'}</div>
                      <div><strong>Correct:</strong> {it.correctAnswer}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setViewingResultIndex(null)}>Close</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  const card = shuffledQuestions[current];

  return (
    <div className="container my-4">
      <h2>Quiz</h2>
      <div className="mb-3">
        <label htmlFor="setSelect"><strong>Choose flashcard set:</strong></label>
        {loadingSets ? (
          <div>Loading sets…</div>
        ) : (
          <div className="d-flex gap-2 my-2">
            <select id="setSelect" className="form-select" value={selectedSet || ''} onChange={(e) => { setSelectedSet(e.target.value); setViewingResultIndex(null); }}>
              <option value="">-- Select a set --</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>{s.title || (s.id === 'local' ? 'Local Flashcards (browser)' : `Set ${s.id}`)}</option>
              ))}
            </select>
            <button className="btn btn-outline-primary" onClick={() => { setShuffledQuestions(shuffle(flashcards)); setCurrent(0); setScore(0); setAnswers([]); setViewingResultIndex(null); setShowResult(false); }}>Start Quiz</button>
          </div>
        )}
      </div>
      <div className="mb-3">
        <strong>Question {current + 1} of {shuffledQuestions.length}:</strong>
        <div className="mt-2 mb-3">{card.question}</div>
        <div>
          {choices.map((choice, idx) => (
            <button
              key={idx}
              className={`btn btn-outline-primary mb-2 w-100${selected === choice ? ' active' : ''}`}
              onClick={() => handleSelect(choice)}
              disabled={selected !== null}
            >
              {choice}
            </button>
          ))}
        </div>
        <hr />
        {selected !== null && (
          <div className="mt-3">
            {selected === card.answer ? (
              <span className="text-success">Correct!</span>
            ) : (
              <span className="text-danger">Incorrect. Correct answer: {card.answer}</span>
            )}
          </div>
        )}
        <button
          className="btn btn-secondary mt-3"
          onClick={handleNext}
          disabled={selected === null}
        >
          {current + 1 < shuffledQuestions.length ? 'Next' : 'Finish'}
        </button>
      </div>
    </div>
  );
}

export default Quiz;
