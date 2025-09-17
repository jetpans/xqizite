from dotenv import load_dotenv
load_dotenv()

from flask_socketio import SocketIO
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, \
    unset_jwt_cookies, jwt_required, JWTManager
from config import DevelopmentConfig, ProductionConfig
from models import UserChatRoom
from controllers.roomController import RoomController
from controllers.chatController import ChatController
from controllers.authController import AuthController
from flask import Flask, jsonify, request, render_template, redirect, session
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

from datetime import datetime, timedelta, timezone
import os
import json




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
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            # access_token = create_access_token(identity=myUser.username, additional_claims={"roleId":myUser.roleId}, expires_delta=timedelta(hours=1))

            access_token = create_access_token(identity=get_jwt_identity(), additional_claims={
                                               "roleId": get_jwt()["roleId"]}, expires_delta=timedelta(hours=1))
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response



authController = AuthController(app, db, bcrypt, jwt)
chatController = ChatController(app, db, jwt, socketio)
roomController = RoomController(app, db, jwt)


with app.app_context():
    db.session.query(UserChatRoom).delete()
    db.session.commit()

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
