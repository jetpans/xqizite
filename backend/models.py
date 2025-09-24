from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from config import DevelopmentConfig, ProductionConfig
from flask_migrate import Migrate
import uuid
from datetime import datetime

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
migrate = Migrate(app, db)  # Initialize Migrate properly


class Account(db.Model):
    __tablename__ = 'accounts'

    accountId = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    passwordHash = db.Column(db.String(72), nullable=True)
    eMail = db.Column(db.String(200), nullable=True)
    profileImage = db.Column(db.String(150))
    experience = db.Column(db.Integer, default=0)
    type = db.Column(db.String(20), default='user')  # e.g., 'user', 'admin', 'guest

    messages = db.relationship('Message', backref='account', cascade="all, delete-orphan")

    def __init__(self, username, passwordHash=None, eMail=None, profileImage=None):
        if not passwordHash or not eMail:
            passwordHash = None
            eMail = None
            profileImage = None
            self.username = username
            self.type = 'guest'
        else:
            self.username = username
            self.passwordHash = passwordHash
            self.eMail = eMail
            self.profileImage = profileImage
            self.type = 'user'


class Question(db.Model):
    __tablename__ = 'questions'

    questionId = db.Column(db.Integer, primary_key=True)
    questionText = db.Column(db.String(500), nullable=False)
    answers = db.relationship('Answer', backref='question', cascade="all, delete-orphan")
    example_answer = db.Column(db.String(500), nullable=False)

    def __init__(self, questionText, example_answer):
        self.questionText = questionText
        self.example_answer = example_answer


class Answer(db.Model):
    __tablename__ = 'answers'

    answerId = db.Column(db.Integer, primary_key=True)
    questionId = db.Column(db.Integer, db.ForeignKey('questions.questionId', ondelete='CASCADE'), nullable=False)
    answerText = db.Column(db.String(500), nullable=False)

    def __init__(self, questionId, answerText):
        self.questionId = questionId
        self.answerText = answerText


class ChatRoom(db.Model):
    __tablename__ = 'chatrooms'

    chatRoomId = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    typeId = db.Column(db.Integer, db.ForeignKey('chatroom_types.typeId'), nullable=False)
    icon = db.Column(db.String(100), nullable=True)  # URL to an icon image
    description = db.Column(db.String(500))
    capacity = db.Column(db.Integer, nullable=False)
    activeQuestionId = db.Column(db.Integer, db.ForeignKey('questions.questionId'), nullable=True)

    messages = db.relationship('Message', backref='chatroom', cascade="all, delete-orphan")
    connected_users = db.relationship('UserChatRoom', backref='chatroom', cascade="all, delete-orphan")
    type = db.relationship('ChatRoomType', backref='chatrooms')

    def __init__(self, name, typeId, capacity, description=None, icon=None):
        self.name = name
        self.typeId = typeId
        self.description = description
        self.icon = icon
        self.capacity = capacity


class ChatRoomType(db.Model):
    __tablename__ = 'chatroom_types'

    typeId = db.Column(db.Integer, primary_key=True)
    typeName = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(200))
    config = db.Column(db.JSON, nullable=True)  # JSON field for additional configurations

    def __init__(self, typeName, description=None, config=None):
        self.typeName = typeName
        self.description = description
        self.config = config


class UserChatRoom(db.Model):
    __tablename__ = 'user_chatroom'

    accountId = db.Column(db.Integer, db.ForeignKey('accounts.accountId',
                          ondelete='CASCADE'), nullable=False, primary_key=True)
    chatRoomId = db.Column(db.Integer, db.ForeignKey('chatrooms.chatRoomId',
                           ondelete='CASCADE'), nullable=False, primary_key=True)

    def __init__(self, accountId, chatRoomId):
        self.accountId = accountId
        self.chatRoomId = chatRoomId


class Message(db.Model):
    __tablename__ = 'messages'

    messageId = db.Column(db.Integer, primary_key=True)
    chatRoomId = db.Column(db.Integer, db.ForeignKey('chatrooms.chatRoomId', ondelete='CASCADE'), nullable=False)
    accountId = db.Column(db.Integer, db.ForeignKey('accounts.accountId', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.String(1000), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    def __init__(self, chatRoomId, accountId, content, timestamp):
        self.chatRoomId = chatRoomId
        self.accountId = accountId
        self.content = content
        self.timestamp = timestamp


class Data(db.Model):
    __tablename__ = 'data'

    entryName = db.Column(db.String(10), primary_key=True, nullable=False)
    value = db.Column(db.String(500), nullable=False)


@app.route('/')
def hello():
    return "Hello world!"


if __name__ == "__main__":
    app.run(debug=True)
