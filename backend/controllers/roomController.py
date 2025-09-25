
from models import ChatRoom, ChatRoomType, UserChatRoom
from controllers.controller import Controller
from sqlalchemy import text


class RoomController(Controller):
    def __init__(self, app, db, jwt):
        super().__init__(app, db, jwt)

        self.app.add_url_rule("/api/rooms", view_func=self.get_rooms, methods=["GET"])


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
