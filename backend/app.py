import os
from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from routes.flashcards import flashcards_bp

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "flashcards.db")

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + db_path
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app)
    db.init_app(app)

    app.register_blueprint(flashcards_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return jsonify({"message": "Study Aid Backend - Flashcards API"}), 200

    @app.route("/api/init", methods=["POST"])
    def init_db():
        with app.app_context():
            db.create_all()
        return jsonify({"status": "ok", "db": db_path}), 201


    return app

if __name__ == "__main__":
    app = create_app()
    if not os.path.exists(db_path):
        with app.app_context():
            db.create_all()
    app.run(debug=True)
