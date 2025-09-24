from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from config import DevelopmentConfig, ProductionConfig
import uuid
from datetime import datetime
from models import ChatRoomType
load_dotenv()
app = Flask(__name__)
env = os.environ.get('FLASK_ENV')

if env == 'production':
    app.config.from_object(ProductionConfig)
else:
    app.config.from_object(DevelopmentConfig)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DB_CONNECT_URL_PROD")
print(f"Using database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")

db = SQLAlchemy(app)


def configurate_types():
    types = [
        {
            "typeName": "standard",
            "description": "A regular experience without pressure, lower rewards though.",
            "config": {
                "new_question_timeout": 5,  # seconds to wait before new question after last one ends
                "end_type": "none",  # 'instant' or 'timer'
                "event_timers": {
                    "init": 0,  # seconds until first clue
                    "clues": [5, 15, 25],  # seconds until next clues
                    "end": 30  # seconds until question ends

                }
            }
        },
        {
            "typeName": "fast",
            "description": "A fast experience. Questions end after first correct answer.",
            "config": {
                "new_question_timeout": 5,  # seconds to wait before new question after last one ends
                "end_type": "instant",  # 'instant' or 'timer'
                "event_timers": {
                    "init": 0,  # seconds until first clue
                    "clues": [5, 15],  # seconds until next clues
                    "end": 30  # seconds until question ends
                }
            }
        }
    ]

    for t in types:
        existing_type = db.session.query(ChatRoomType).filter_by(typeName=t["typeName"]).first()
        if not existing_type:
            new_type = ChatRoomType(typeName=t["typeName"], description=t["description"], config=t["config"])
            db.session.add(new_type)
        else:
            existing_type.description = t["description"]
            existing_type.config = t["config"]
            db.session.add(existing_type)
    db.session.commit()


if __name__ == "__main__":
    with app.app_context():
        configurate_types()
        print("Configuration complete.")
