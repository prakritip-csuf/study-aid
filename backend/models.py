from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class FlashcardSet(db.Model):
    set_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500), default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    flashcards = db.relationship("Flashcard", backref="set", lazy=True)

    def to_dict(self):
        return {
            "id": self.set_id,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
        }


class Flashcard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(500), nullable=False)
    answer = db.Column(db.String(500), nullable=False)
    tags = db.Column(db.String(200), default="")
    set_id = db.Column(db.Integer, db.ForeignKey("flashcard_set.set_id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    times_seen = db.Column(db.Integer, default=0)
    correct_count = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "question": self.question,
            "answer": self.answer,
            "tags": self.tags.split(",") if self.tags else [],
            "set_id": self.set_id,
            "created_at": self.created_at.isoformat(),
            "times_seen": self.times_seen,
            "correct_count": self.correct_count,
        }
    
class UserProgress(db.Model):
    __tablename__ = "user_progress"
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, nullable=False)
    set_id = db.Column(db.Integer, db.ForeignKey("flashcard_set.set_id"), nullable=False)
    completed_count = db.Column(db.Integer, default=0)
    total_count = db.Column(db.Integer, default=0)
    percentage = db.Column(db.Float, default=0.0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint("user_id", "set_id", name="unique_user_set"),)

    def update_percentage(self):
        if self.total_count > 0:
            self.percentage = round((self.completed_count / self.total_count) * 100, 2)
        else:
            self.percentage = 0.0

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "set_id": self.set_id,
            "completed_count": self.completed_count,
            "total_count": self.total_count,
            "percentage": self.percentage,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }