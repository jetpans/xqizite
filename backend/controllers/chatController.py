from flask import request, session
from flask_socketio import join_room, leave_room, emit
from controllers.controller import Controller
from flask_jwt_extended import get_jwt_identity, decode_token
from datetime import datetime
from models import Account, UserChatRoom, Message
import pprint
from util import verify_jwt, get_user_from_jwt


class ChatController(Controller):
    def __init__(self, app, db, jwt, socketio, game_controller):
        super().__init__(app, db, jwt)
        self.socketio = socketio
        self.db = db
        self.game_controller = game_controller
        self.denied_users = set()
        self.username_to_avatar = {}

        self.socketio.on_event("connect", self.connect)
        self.socketio.on_event("disconnect", self.disconnect)
        self.socketio.on_event("join_room", self.join_chatroom)
        self.socketio.on_event("leave_room", self.leave_chatroom)
        self.socketio.on_event("send_message", self.send_message)

    # Fetch token from socket like following socket.handshake.auth.token
    def connect(self, socket):
        token = socket["token"]
        try:
            verify_jwt(token)
        except Exception as e:
            print(f"Invalidation token because of exception {e}")
            emit("invalid_token", "Invalid token, disconnecting.")
            return
        user = get_user_from_jwt(token)

        session["username"] = user
        session["sid"] = request.sid

        acc = self.db.session.query(Account).filter_by(username=user).first()
        if acc:
            self.username_to_avatar[user] = acc.avatar

        if not acc and user in self.username_to_avatar:
            account = Account(
                username=user,
                avatar=self.username_to_avatar[user])
            self.db.session.add(account)
            self.db.session.commit()
            acc = account

        if not acc:
            emit("invalid_token", "Account not found, disconnecting.")
            return

        connections = self.db.session.query(UserChatRoom).filter_by(accountId=acc.accountId).all()
        if connections:
            # Deny connection
            emit("invalid_token", "Already connected from another device.")
            self.denied_users.add(session["sid"])
            return

        print(f"User {user} connected.")
        room_counts = self.get_room_counts()
        emit("update_user_counts", room_counts)

    def disconnect(self):
        user = session.get("username")
        if session["sid"] in self.denied_users:
            self.denied_users.remove(session["sid"])
            print(f"Denied connection for {user}.")
            return
        account = self.db.session.query(Account).filter_by(username=user).first()
        if not account:
            print(f"Account for user {user} not found on disconnect.")
            return
        rooms = self.db.session.query(UserChatRoom).filter_by(accountId=account.accountId).all()
        connected_to_rooms = []
        for room in rooms:
            leave_room(room.chatRoomId)
            connected_to_rooms.append(room.chatRoomId)

        self.db.session.query(UserChatRoom).filter_by(accountId=account.accountId).delete()
        if account.type == 'guest':
            self.db.session.delete(account)
        self.db.session.commit()
        room_counts = self.get_room_counts()
        emit("update_user_counts", room_counts, broadcast=True)

        for room_id in connected_to_rooms:
            emit("update_connected_users", self.get_connected_users(room_id), room=room_id)
        print(f"User {user} disconnected from all rooms.")

    def join_chatroom(self, data):
        user = session.get("username")
        if not user:
            print("User not authenticated.")
            return

        to_room = data.get("chatRoomId")
        account = self.db.session.query(Account).filter_by(username=user).first()
        connected_to = self.db.session.query(UserChatRoom).filter_by(accountId=account.accountId).first()

        # If already connected to a room throw error

        new_connection = UserChatRoom(
            accountId=account.accountId,
            chatRoomId=to_room
        )

        self.db.session.add(new_connection)
        self.db.session.commit()

        join_room(to_room)

        room_counts = self.get_room_counts()
        emit("update_user_counts", room_counts, broadcast=True)
        emit("update_connected_users", self.get_connected_users(data.get("chatRoomId")), room=data.get("chatRoomId"))
        emit("update_question", self.game_controller.room_latest_updates.get(to_room, {}), room=to_room)


        print(f"Client connected: {user} to room {to_room}")

    def leave_chatroom(self, data):
        user = session.get("username")

        account = self.db.session.query(Account).filter_by(username=user).first()
        self.db.session.query(UserChatRoom).filter_by(accountId=account.accountId).delete()
        self.db.session.commit()
        leave_room(data.get("chatRoomId"))
        room_counts = self.get_room_counts()
        emit("update_user_counts", room_counts, broadcast=True)

        emit("update_connected_users", self.get_connected_users(data.get("chatRoomId")), room=data.get("chatRoomId"))
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

        correct_answer = self.game_controller.process_message(room, user, message)

        if correct_answer:
            message = "Correct!"
        print(f"Message from {user} in room {room}: {message}")
        emit("message_from_server", {
            "username": user,
            "message": message,
            "avatar": account.avatar,
            "timestamp": timestamp,
            "messageId": the_message.messageId,
            'isCorrect': correct_answer

        }, room=room)

    def get_room_counts(self):
        stmt = self.db.session.query(
            UserChatRoom.chatRoomId,
            self.db.func.count(UserChatRoom.accountId).label('user_count')
        ).group_by(UserChatRoom.chatRoomId).all()

        room_counts = {chatRoomId: user_count for chatRoomId, user_count in stmt}
        return room_counts
    
    def get_connected_users(self, room_id):
        stmt = self.db.session.query(
            Account.username,
            Account.avatar
        ).join(UserChatRoom, Account.accountId == UserChatRoom.accountId
        ).filter(UserChatRoom.chatRoomId == room_id).all()

        users = [{"username": username, "avatar": avatar} for username, avatar in stmt]
        return users