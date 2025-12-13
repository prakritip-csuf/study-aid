from flask import Blueprint, request, jsonify
import os
import json
import re
import openai
from models import db, Flashcard, FlashcardSet

flashcards_bp = Blueprint("flashcards_bp", __name__)


def _extract_json_array(text: str):
    # Get JSON response from model
    start = text.find('[')
    end = text.rfind(']')
    if start == -1 or end == -1 or end <= start:
        raise ValueError('No JSON array found in model response')
    candidate = text[start:end+1]
    # Format response
    candidate = re.sub(r"```(?:json)?\n|```", '', candidate)
    return json.loads(candidate)

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
    cards = Flashcard.query.filter_by(set_id).all()

    return jsonify({
        "id": flashcard_set.id,
        "title": flashcard_set.title,
        "description": flashcard_set.description,
        "cards": [c.to_dict() for c in cards]
    })


@flashcards_bp.route("/flashcards/sets/<int:set_id>/cards", methods=["GET"])
def get_cards(set_id):
    cards = Flashcard.query.filter_by(set_id=set_id).all()
    return jsonify([c.to_dict() for c in cards])


@flashcards_bp.route("/flashcards/sets/<int:set_id>/cards", methods=["POST"])
def create_card(set_id):
    data = request.get_json() or {}
    question = data.get("question")
    answer = data.get("answer")

    if not question or not answer:
        return jsonify({"error": "Question and answer required"}), 400

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


# AI generated flashcards
@flashcards_bp.route("/flashcards/generate", methods=["POST"])
def generate_flashcards():
    """Generate flashcards using OpenAI based on a topic provided by the user.

    Request JSON:
      {
        "topic": "Photosynthesis",
        "count": 5,
        "create_set": true,
        "set_title": "Photosynthesis (AI generated)"
      }

    Response: list of created (or generated) cards.
    """
    data = request.get_json() or {}
    topic = (data.get("topic") or "").strip()
    count = int(data.get("count", 5))
    count = max(1, min(count, 20))
    create_set = bool(data.get("create_set", True))
    set_title = data.get("set_title")

    if not topic:
        return jsonify({"error": "topic is required"}), 400

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return jsonify({"error": "OPENAI_API_KEY not set in environment"}), 500

    prompt = (
        f"You are an assistant that generates simple flashcards for a study aid tool. "
        f"Given the topic '{topic}', produce {count} flashcards. "
        "Return only a JSON array where each item is an object with keys: 'question', 'answer', and optional 'tags' (array of short strings). "
        "Be brief in questions and answers. Example output:\n"
        "[ {\"question\": \"Q?\", \"answer\": \"A.\", \"tags\": [\"tag1\"] }, ... ]"
    )

    try:
        client = openai.OpenAI(api_key=api_key)
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800,
        )
        content = resp.choices[0].message.content
    except Exception as e:
        return jsonify({"error": "AI request failed", "details": str(e)}), 502

    try:
        items = _extract_json_array(content)
    except Exception:
        try:
            items = json.loads(content)
        except Exception as exc:
            return jsonify({"error": "Failed to parse AI response", "raw": content, "details": str(exc)}), 502

    # Add flashcard to database
    created = []
    with db.session.begin_nested():
        card_set = None
        if create_set:
            title = set_title.strip() if set_title else f"AI: {topic}"
            card_set = FlashcardSet(title=title, description=f"Generated by AI for topic: {topic}")
            db.session.add(card_set)
            db.session.flush()  

        for it in items[:count]:
            q = it.get("question") or it.get("q") or ""
            a = it.get("answer") or it.get("a") or ""
            tags = it.get("tags") or []
            if isinstance(tags, list):
                tags_str = ",".join([str(t).strip() for t in tags if t])
            else:
                tags_str = str(tags)

            card = Flashcard(question=q, answer=a, tags=tags_str, set_id=(card_set.set_id if card_set else 0))
            if not create_set:
                default_set = FlashcardSet.query.first()
                if not default_set:
                    default_set = FlashcardSet(title=f"AI Generated: {topic}")
                    db.session.add(default_set)
                    db.session.flush()
                card.set_id = default_set.set_id
            db.session.add(card)
            db.session.flush()
            created.append(card.to_dict())

        db.session.commit()

    return jsonify(created), 201


# AI-generated distractors for quiz questions
@flashcards_bp.route("/flashcards/distractors", methods=["POST"])
def generate_distractors():
    """Return a small list of plausible incorrect answers (distractors).

    Request JSON:
      { "question": "...", "answer": "...", "count": 3 }

    Response: JSON array of strings (distractors)
    """
    data = request.get_json() or {}
    question = (data.get("question") or "").strip()
    answer = (data.get("answer") or "").strip()
    try:
        count = int(data.get("count", 3))
    except Exception:
        count = 3
    count = max(1, min(count, 6))

    if not question or not answer:
        return jsonify({"error": "question and answer are required"}), 400

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return jsonify({"error": "OPENAI_API_KEY not set in environment"}), 500

    prompt = (
        "You are an assistant that generates plausible multiple-choice distractors.\n"
        "Given the question and the correct answer, produce %d concise, plausible incorrect answer options.\n"
        "Return only a JSON array of strings (no explanation).\n"
        "Question: '%s'\n"
        "Correct answer: '%s'\n"
        "Example output: [\"option1\", \"option2\", \"option3\"]\n"
    ) % (count, question.replace('\n', ' '), answer.replace('\n', ' '))

    try:
        client = openai.OpenAI(api_key=api_key)
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200,
        )
        content = resp.choices[0].message.content
    except Exception as e:
        return jsonify({"error": "AI request failed", "details": str(e)}), 502

    # Try to parse as JSON array
    try:
        arr = _extract_json_array(content)
        if not isinstance(arr, list):
            raise ValueError("Expected JSON array")
        # ensure strings
        arr = [str(x).strip() for x in arr if x]
    except Exception:
        try:
            parsed = json.loads(content)
            if isinstance(parsed, list):
                arr = [str(x).strip() for x in parsed if x]
            else:
                raise ValueError("Not a list")
        except Exception as exc:
            return jsonify({"error": "Failed to parse AI response", "raw": content, "details": str(exc)}), 502

    # Trim to requested count
    arr = [a for a in arr if a and a.lower() != answer.lower()]
    arr = arr[:count]
    return jsonify(arr), 200
