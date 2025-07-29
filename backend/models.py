from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from config import DevelopmentConfig, ProductionConfig

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


class Account(db.Model):
    __tablename__ = 'accounts'

    accountId = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    passwordHash = db.Column(db.String(72), nullable=False)
    eMail = db.Column(db.String(200), nullable=False)
    profileImage = db.Column(db.String(150))
    experience = db.Column(db.Integer, default=0)

    def __init__(self,  username, passwordHash, eMail, profileImage=None):
        self.username = username
        self.passwordHash = passwordHash
        self.eMail = eMail
        self.profileImage = profileImage


class Question(db.Model):
    __tablename__ = 'questions'

    questionId = db.Column(db.Integer, primary_key=True)
    questionText = db.Column(db.String(500), nullable=False)

    def __init__(self, questionText):
        self.questionText = questionText


class Answer(db.Model):
    __tablename__ = 'answers'

    answerId = db.Column(db.Integer, primary_key=True)
    questionId = db.Column(db.Integer, db.ForeignKey('questions.questionId'), nullable=False)
    answerText = db.Column(db.String(500), nullable=False)

    def __init__(self, questionId, answerText):
        self.questionId = questionId
        self.answerText = answerText


class ChatRoom(db.Model):
    __tablename__ = 'chatrooms'

    chatRoomId = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))

    def __init__(self, name, description=None):
        self.name = name
        self.description = description


class UserChatRoom(db.Model):
    __tablename__ = 'user_chatroom'

    accountId = db.Column(db.Integer, db.ForeignKey('accounts.accountId'), nullable=False, primary_key=True)
    chatRoomId = db.Column(db.Integer, db.ForeignKey('chatrooms.chatRoomId'), nullable=False, primary_key=True)

    def __init__(self, accountId, chatRoomId):
        self.accountId = accountId
        self.chatRoomId = chatRoomId


class Message(db.Model):
    __tablename__ = 'messages'

    messageId = db.Column(db.Integer, primary_key=True)
    chatRoomId = db.Column(db.Integer, db.ForeignKey('chatrooms.chatRoomId'), nullable=False)
    accountId = db.Column(db.Integer, db.ForeignKey('accounts.accountId'), nullable=False)
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
    with app.app_context():
        db.create_all()
