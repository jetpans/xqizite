
from models import ChatRoom, ChatRoomType, UserChatRoom
from controllers.controller import Controller
from sqlalchemy import text


class RoomController(Controller):
    def __init__(self, app, db, jwt):
        super().__init__(app, db, jwt)

        self.app.add_url_rule("/api/rooms", view_func=self.get_rooms, methods=["GET"])
# {
#       chatRoomId: 2,
#       name: "Tech Talk",
#       typeName: "default",
#       type_description: "Fast room",
#       population: 5,
#       capacity: 20,
#       icon: "https://img.icons8.com/?size=100&id=87201&format=png&color=000000",
#       description: "Discuss the latest in technology",
#     },


# class ChatRoom(db.Model):
#     __tablename__ = 'chatrooms'

#     chatRoomId = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(100), nullable=False)
#     typeId = db.Column(db.Integer, db.ForeignKey('chatroom_types.typeId'), nullable=False)
#     icon = db.Column(db.String(100), nullable=True)  # URL to an icon image
#     description = db.Column(db.String(500))
#     capacity = db.Column(db.Integer, nullable=False)
#     activeQuestionId = db.Column(db.Integer, db.ForeignKey('questions.questionId'), nullable=True)

#     def __init__(self, name, typeId, capacity, description=None, icon=None):
#         self.name = name
#         self.typeId = typeId
#         self.description = description
#         self.icon = icon
#         self.capacity = capacity


    def get_rooms(self):
        # all_rooms = self.db.session.query(ChatRoom, ChatRoomType).join(ChatRoomType).all()
        # show me how to execute sql

        sql = text('''
        SELECT rooms."chatRoomId", rooms.name, 
        chatroom_types."typeName", chatroom_types.description,                 
        rooms.icon, rooms.capacity, 
        COUNT(user_chatroom."accountId") as population
        from chatrooms as rooms join chatroom_types on rooms."typeId" = chatroom_types."typeId"
        left join user_chatroom on rooms."chatRoomId" = user_chatroom."chatRoomId"
        GROUP BY rooms."chatRoomId", rooms.name, chatroom_types."typeName", 
        chatroom_types.description, rooms.icon, rooms.capacity
        ''')
        all_rooms = self.db.session.execute(sql).fetchall()

        required = []
        for room in all_rooms:
            required.append(
                {
                    "chatRoomId": room.chatRoomId,
                    "name": room.name,
                    "typeName": room.typeName,
                    "type_description": room.description,
                    "population": room.population,
                    "capacity": room.capacity,
                    "icon": room.icon,
                    "description": room.description,
                }
            )

        return {"success": True, "data": required}, 200
