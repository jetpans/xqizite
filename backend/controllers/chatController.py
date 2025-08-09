from flask import request, session
from flask_socketio import join_room, leave_room, emit
from controllers.controller import Controller
from flask_jwt_extended import get_jwt_identity, decode_token
from datetime import datetime
from models import Account, UserChatRoom, Message
import pprint
from util import verify_jwt, get_user_from_jwt


class ChatController(Controller):
    def __init__(self, app, db, jwt, socketio):
        super().__init__(app, db, jwt)
        self.socketio = socketio
        self.db = db

        self.socketio.on_event("connect", self.connect)
        self.socketio.on_event("disconnect", self.disconnect)
        self.socketio.on_event("join_room", self.join_chatroom)
        self.socketio.on_event("leave_room", self.leave_chatroom)
        self.socketio.on_event("send_message", self.send_message)

    # Fetch token from socket like following socket.handshake.auth.token
    def connect(self, socket):
        token = socket["token"]
        verify_jwt(token)
        user = get_user_from_jwt(token)
        session["username"] = user
        print(f"User {user} connected.")

    def disconnect(self):
        user = session.get("username")

        account = self.db.session.query(Account).filter_by(username=user).first()
        rooms = self.db.session.query(UserChatRoom).filter_by(accountId=account.accountId).all()
        for room in rooms:
            leave_room(room.chatRoomId)
        self.db.session.query(UserChatRoom).filter_by(accountId=account.accountId).delete()
        self.db.session.commit()
        print(f"User {user} disconnected from all rooms.")

    def join_chatroom(self, data):
        user = session.get("username")
        if not user:
            print("User not authenticated.")
            return

        to_room = data.get("chatRoomId")
        account = self.db.session.query(Account).filter_by(username=user).first()

        new_connection = UserChatRoom(
            accountId=account.accountId,
            chatRoomId=to_room
        )

        self.db.session.add(new_connection)
        self.db.session.commit()

        join_room(to_room)

        print(f"Client connected: {user} to room {to_room}")

    def leave_chatroom(self, data):
        user = session.get("username")
        account = self.db.session.query(Account).filter_by(username=user).first()
        self.db.session.query(UserChatRoom).filter_by(accountId=account.accountId).delete()
        self.db.session.commit()
        leave_room(data.get("chatRoomId"))
        print(f"Client disconnected: {user} from any room.")

    def send_message(self, data):
        user = session.get("username")
        account = self.db.session.query(Account).filter_by(username=user).first()
        room = data.get("chatRoomId")
        message = data.get("message")
        timestamp = datetime.utcnow().isoformat()

        acc_in_room = self.db.session.query(UserChatRoom).filter_by(
            accountId=account.accountId, chatRoomId=room).first()
        if acc_in_room is None:
            print(f"Invalid message from {user} in room {room}. User not in room.")
            return

        the_message = Message(
            chatRoomId=room,
            accountId=account.accountId,
            content=message,
            timestamp=datetime.utcnow()
        )

        self.db.session.add(the_message)

        self.db.session.commit()

        print(f"Message from {user} in room {room}: {message}")
        emit("message_from_server", {
            "username": user,
            "message": message,
            "timestamp": timestamp,
            "messageId": the_message.messageId

        }, room=room)
