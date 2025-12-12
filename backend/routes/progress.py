from flask import Blueprint, request, jsonify
from models import db, UserProgress, FlashcardSet
from datetime import datetime

progress_bp = Blueprint("progress", __name__, url_prefix="/api/progress")


# ---------------------------
# Increment progress by 1
# ---------------------------
@progress_bp.route("/<int:set_id>/increment", methods=["POST"])
def increment_progress(set_id):
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"error": "user_id is required"}), 400

    user_id = data["user_id"]

    # Get total flashcards from FlashcardSet table
    flashcard_set = FlashcardSet.query.filter_by(set_id=set_id).first()
    if not flashcard_set:
        return jsonify({"error": "Flashcard set not found"}), 404

    total_cards = len(flashcard_set.flashcards)

    # Find existing progress
    progress = UserProgress.query.filter_by(user_id=user_id, set_id=set_id).first()

    # If not found → create new row
    if not progress:
        progress = UserProgress(
            user_id=user_id,
            set_id=set_id,
            completed_count=0,
            total_count=total_cards
        )
        db.session.add(progress)

    # Increment completed count (but do not exceed total)
    if progress.completed_count < total_cards:
        progress.completed_count += 1

    # Update percentage
    progress.total_count = total_cards
    progress.update_percentage()
    progress.updated_at = datetime.utcnow()

    db.session.commit()

    return jsonify(progress.to_dict()), 200


# ---------------------------
# Reset progress
# ---------------------------
@progress_bp.route("/<int:set_id>/reset", methods=["POST"])
def reset_progress(set_id):
    data = request.get_json()
    if not data or "user_id" not in data:
        return jsonify({"error": "user_id is required"}), 400

    user_id = data["user_id"]

    progress = UserProgress.query.filter_by(user_id=user_id, set_id=set_id).first()
    if not progress:
        return jsonify({"error": "Progress not found"}), 404

    progress.completed_count = 0
    progress.update_percentage()
    progress.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(progress.to_dict()), 200


# ---------------------------
# Fetch progress
# ---------------------------
@progress_bp.route("/<int:user_id>/<int:set_id>", methods=["GET"])
def get_progress(user_id, set_id):
    progress = UserProgress.query.filter_by(user_id=user_id, set_id=set_id).first()
    if not progress:
        # If no progress yet, return 0
        flashcard_set = FlashcardSet.query.filter_by(set_id=set_id).first()
        total_cards = len(flashcard_set.flashcards) if flashcard_set else 0
        return jsonify({
            "user_id": user_id,
            "set_id": set_id,
            "completed_count": 0,
            "total_count": total_cards,
            "percentage": 0.0
        }), 200

    return jsonify(progress.to_dict()), 200
