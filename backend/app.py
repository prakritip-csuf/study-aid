import os
from datetime import datetime

from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'flashcards.db')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)


class Flashcard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    tags = db.Column(db.Text, default='')
    times_seen = db.Column(db.Integer, default=0)
    correct_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': self.answer,
            'tags': [t for t in (self.tags.split(',') if self.tags else []) if t],
            'times_seen': self.times_seen,
            'correct_count': self.correct_count,
            'created_at': self.created_at.isoformat()
        }


@app.route('/')
def home():
    return jsonify({'message': 'Study Aid Backend — flashcards API'}), 200


@app.route('/api/init', methods=['POST'])
def init_db():
    """Dev helper: initialize the database (creates file and tables)."""
    db.create_all()
    return jsonify({'status': 'ok', 'db': db_path}), 201


@app.route('/api/flashcards', methods=['GET'])
def list_flashcards():
    tag = request.args.get('tag')
    if tag:
        cards = Flashcard.query.filter(Flashcard.tags.like(f"%{tag}%"))
    else:
        cards = Flashcard.query
    cards = cards.order_by(Flashcard.created_at.desc()).all()
    return jsonify([c.to_dict() for c in cards])


@app.route('/api/flashcards', methods=['POST'])
def create_flashcard():
    data = request.get_json() or {}
    question = data.get('question')
    answer = data.get('answer')
    tags = data.get('tags', [])

    if not question or not answer:
        return jsonify({'error': 'question and answer are required'}), 400

    if isinstance(tags, list):
        tags_str = ','.join([t.strip() for t in tags if t])
    else:
        tags_str = str(tags)

    card = Flashcard(question=question.strip(), answer=answer.strip(), tags=tags_str)
    db.session.add(card)
    db.session.commit()
    return jsonify(card.to_dict()), 201


@app.route('/api/flashcards/<int:card_id>', methods=['GET'])
def get_flashcard(card_id):
    card = Flashcard.query.get_or_404(card_id)
    return jsonify(card.to_dict())


@app.route('/api/flashcards/<int:card_id>', methods=['PUT'])
def update_flashcard(card_id):
    card = Flashcard.query.get_or_404(card_id)
    data = request.get_json() or {}
    question = data.get('question')
    answer = data.get('answer')
    tags = data.get('tags')

    if question is not None:
        card.question = question
    if answer is not None:
        card.answer = answer
    if tags is not None:
        if isinstance(tags, list):
            card.tags = ','.join([t.strip() for t in tags if t])
        else:
            card.tags = str(tags)

    db.session.commit()
    return jsonify(card.to_dict())


@app.route('/api/flashcards/<int:card_id>', methods=['DELETE'])
def delete_flashcard(card_id):
    card = Flashcard.query.get_or_404(card_id)
    db.session.delete(card)
    db.session.commit()
    return jsonify({'status': 'deleted', 'id': card_id})


@app.route('/api/flashcards/random', methods=['GET'])
def random_flashcard():
    # simple random selection
    card = Flashcard.query.order_by(db.func.random()).first()
    if not card:
        return jsonify({'error': 'no flashcards available'}), 404
    return jsonify(card.to_dict())


@app.route('/api/flashcards/<int:card_id>/answer', methods=['POST'])
def submit_answer(card_id):
    """Report whether the answer was correct. Request JSON: {"correct": true/false} """
    card = Flashcard.query.get_or_404(card_id)
    data = request.get_json() or {}
    correct = data.get('correct')
    if correct is None:
        return jsonify({'error': 'missing "correct" boolean in body'}), 400

    card.times_seen = (card.times_seen or 0) + 1
    if bool(correct):
        card.correct_count = (card.correct_count or 0) + 1

    db.session.commit()
    return jsonify(card.to_dict())


if __name__ == '__main__':
    # Ensure database exists when running directly
    if not os.path.exists(db_path):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        # create_all requires an application context
        with app.app_context():
            db.create_all()
    app.run(debug=True)
