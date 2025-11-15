import React, { useState, useEffect } from 'react';

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
  const [current, setCurrent] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const cards = raw ? JSON.parse(raw) : [];
      setFlashcards(cards);
      setShuffledQuestions(shuffle(cards));
      setCurrent(0);
    } catch (e) {
      setFlashcards([]);
      setShuffledQuestions([]);
    }
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
    }
  }, [shuffledQuestions, current, flashcards]);

  function handleSelect(choice) {
    setSelected(choice);
  }

  function handleNext() {
    if (selected === shuffledQuestions[current].answer) {
      setScore(s => s + 1);
    }
    if (current + 1 < shuffledQuestions.length) {
      setCurrent(c => c + 1);
    } else {
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
        <button className="btn btn-primary" onClick={() => {
          setShuffledQuestions(shuffle(flashcards));
          setCurrent(0);
          setScore(0);
          setShowResult(false);
        }}>Restart Quiz</button>
      </div>
    );
  }

  const card = shuffledQuestions[current];

  return (
    <div className="container my-4">
      <h2>Quiz</h2>
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
