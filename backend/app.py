from flask_socketio import SocketIO
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, \
    unset_jwt_cookies, jwt_required, JWTManager
from config import DevelopmentConfig, ProductionConfig
from models import UserChatRoom,Account
from controllers.roomController import RoomController
from controllers.chatController import ChatController
from controllers.authController import AuthController
from controllers.gameController import GameController

from flask import Flask, jsonify, request, render_template, redirect, session
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

from datetime import datetime, timedelta, timezone
import os
import json
import threading



app = Flask(__name__)

env = os.environ.get('FLASK_ENV')
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["IMAGE_DIRECTORY"] = "images"


app.config['MAX_CONTENT_LENGTH'] = 7 * 1024 * 1024  # X * 1024 *1024 === X Megabytes


if env == 'production':
    app.config.from_object(ProductionConfig)
else:
    app.config.from_object(DevelopmentConfig)

bcrypt = Bcrypt(app)
db = SQLAlchemy(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.before_request
def do():
    # print(request.headers)
    pass


@app.route("/")
def home():
    return {"success": True, "data": "API is running"}
    # return render_template("index.html")


@app.route("/heartbeat")
def heartbeat():
    return {"success": True, "data": "API is running"}

# @app.route("/<path:path>", methods=["GET"])
# def catch_all(path):
#     return {"success": True, "data": "API is running"}
#     # return render_template("index.html")


@app.after_request
def add_cors_headers(response):


    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.after_request
def add_cors_headers(response):
    # Get the origin from the request
    origin = request.headers.get('Origin')

    # Allow specific origins
    allowed_origins = [
        'http://localhost:3000',
        'https://jetpans.com',
        'https://www.jetpans.com',
        'http://jetpans.com',
        'http://www.jetpans.com',
    ]

    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin

    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Max-Age'] = '3600'  # Cache preflight for 1 hour

    return response


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response


authController = AuthController(app, db, bcrypt, jwt)
gameController = GameController(app, db, socketio,jwt)
chatController = ChatController(app, db, jwt, socketio, gameController)
roomController = RoomController(app, db, jwt)

if os.environ.get("GUNICORN_WORKER_ID") is None:
    game_thread = threading.Thread(target=gameController.game_loop, daemon=True)
    game_thread.start()

with app.app_context():
    db.session.query(UserChatRoom).delete()
    db.session.query(Account).filter_by(type="guest").delete()
    db.session.commit()

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
