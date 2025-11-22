from flask import Blueprint, request, jsonify
from models import db, Flashcard, FlashcardSet

flashcards_bp = Blueprint("flashcards_bp", __name__)

# GET all sets
@flashcards_bp.route("/flashcards/sets", methods=["GET"])
def list_sets():
    sets = FlashcardSet.query.order_by(FlashcardSet.created_at.desc()).all()
    return jsonify([s.to_dict() for s in sets])


# CREATE a set
@flashcards_bp.route("/flashcards/sets", methods=["POST"])
def create_set():
    data = request.get_json() or {}

    title = data.get("title")
    description = data.get("description", "")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    new_set = FlashcardSet(title=title.strip(), description=description.strip())
    db.session.add(new_set)
    db.session.commit()

    return jsonify(new_set.to_dict()), 201

# DELETE a flashcard set
@flashcards_bp.route("/flashcards/sets/<int:set_id>", methods=["DELETE"])
def delete_set(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    db.session.delete(flashcard_set)
    db.session.commit()
    
    return jsonify({"success": True, "message": f"Flashcard set {set_id} deleted."})

# GET one set
@flashcards_bp.route("/flashcards/sets/<int:set_id>", methods=["GET"])
def get_set(set_id):
    flashcard_set = FlashcardSet.query.get_or_404(set_id)
    # Just return all flashcards, ignoring set_id
    cards = Flashcard.query.filter_by(set_id).all()

    return jsonify({
        "id": flashcard_set.id,
        "title": flashcard_set.title,
        "description": flashcard_set.description,
        "cards": [c.to_dict() for c in cards]
    })


@flashcards_bp.route("/flashcards/sets/<int:set_id>/cards", methods=["GET"])
def get_cards(set_id):
    # Return all flashcards, ignoring set_id
    cards = Flashcard.query.filter_by(set_id=set_id).all()
    return jsonify([c.to_dict() for c in cards])


@flashcards_bp.route("/flashcards/sets/<int:set_id>/cards", methods=["POST"])
def create_card(set_id):
    data = request.get_json() or {}
    question = data.get("question")
    answer = data.get("answer")

    if not question or not answer:
        return jsonify({"error": "Question and answer required"}), 400

    # enforce global limit instead of per-set
    count = Flashcard.query.count()
    if count >= 50:
        return jsonify({"error": "Flashcard limit reached (50)."}), 400

    card = Flashcard(question=question, answer=answer, set_id=set_id)
    db.session.add(card)
    db.session.commit()

    return jsonify(card.to_dict()), 201


# UPDATE
@flashcards_bp.route("/flashcards/cards/<int:card_id>", methods=["PUT"])
def update_card(card_id):
    data = request.get_json() or {}

    card = Flashcard.query.get_or_404(card_id)
    card.question = data.get("question", card.question)
    card.answer = data.get("answer", card.answer)

    db.session.commit()
    return jsonify(card.to_dict())


# DELETE
@flashcards_bp.route("/flashcards/cards/<int:card_id>", methods=["DELETE"])
def delete_card(card_id):
    card = Flashcard.query.get_or_404(card_id)
    db.session.delete(card)
    db.session.commit()
    return jsonify({"success": True})
