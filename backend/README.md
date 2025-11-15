# Study Aid — Backend

Flask backend that exposes a flashcards API and stores data in `flashcards.db` (SQLite).

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Initialize the database:

```bash
curl -X POST http://127.0.0.1:5000/api/init
```

3. Run the app:

```bash
python app.py
```

API highlights:

- GET /api/flashcards — list all flashcards
- POST /api/flashcards — create a new card (JSON: {question, answer, tags: ["tag1","tag2"]})
- GET /api/flashcards/<id> — get a single card
- PUT /api/flashcards/<id> — update a card
- DELETE /api/flashcards/<id> — remove a card
- GET /api/flashcards/random — get a random card for practice
- POST /api/flashcards/<id>/answer — submit result {"correct": true}

