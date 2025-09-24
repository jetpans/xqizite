from flask import request, session
from flask_socketio import join_room, leave_room, emit
from controllers.controller import Controller
from flask_jwt_extended import get_jwt_identity, decode_token
from datetime import datetime
from models import Account, UserChatRoom, Message, ChatRoomType
import pprint
from util import verify_jwt, get_user_from_jwt
from models import ChatRoom, Question, Answer
import time
from sqlalchemy.sql.expression import func
import random
import threading
from dataclasses import dataclass
from typing import List, Dict, Any


class GameController(Controller):
    def __init__(self, app, db, socketio, jwt):
        super().__init__(app, db, jwt)
        self.socketio = socketio
        self.db = db
        with app.app_context():
            self.availible_rooms = self.db.session.query(ChatRoom).options(
                db.joinedload(ChatRoom.type)).all()

        self.room_locks = {room.chatRoomId: threading.RLock() for room in self.availible_rooms}

        self.room_latest_updates = {room.chatRoomId: 0 for room in self.availible_rooms}
        self.correct_users = {room.chatRoomId: set() for room in self.availible_rooms}
        self.room_counters = {room.chatRoomId: 0 for room in self.availible_rooms}

        self.CLUE_CALCULATORS = [self.clue_empties, self.clue_first_letters, self.clue_fifty_percent]
        self.room_event_timers = {room.chatRoomId: room.type.config["event_timers"] for room in self.availible_rooms}

    def game_loop(self):
        while True:
            try:
                with self.app.app_context():
                    self.availible_rooms = self.db.session.query(ChatRoom).options(
                        self.db.joinedload(ChatRoom.type)).all()
                    for room in self.availible_rooms:
                        with self.room_locks[room.chatRoomId]:
                            counter = self.room_counters[room.chatRoomId]
                            timers = self.room_event_timers[room.chatRoomId]

                            if counter == timers["init"]:
                                question = self.get_random_question()
                                self.db.session.query(ChatRoom).filter_by(chatRoomId=room.chatRoomId).update(
                                    {"activeQuestionId": question.questionId})
                                self.db.session.commit()
                                msg = {"roomId": room.chatRoomId, "question": question.questionText}
                                self.socketio.emit("update_question", msg, room=room.chatRoomId)
                                self.room_latest_updates[room.chatRoomId] = msg
                                print(f"New question in room {room.chatRoomId}: {question.questionText}")
                                pass
                            elif counter in timers["clues"]:
                                question = self.db.session.query(Question).filter_by(
                                    questionId=room.activeQuestionId).first()
                                answer = question.example_answer
                                clue_calculator = self.CLUE_CALCULATORS[timers["clues"].index(counter)]
                                clue = clue_calculator(answer)
                                msg = {"roomId": room.chatRoomId, "question": question.questionText, "clue": clue}
                                self.socketio.emit("update_question", msg, room=room.chatRoomId)
                                self.room_latest_updates[room.chatRoomId] = msg
                                print(f"Clue for room {room.chatRoomId}: {clue}")
                                pass
                            elif counter >= timers["end"]:
                                question = self.db.session.query(Question).filter_by(
                                    questionId=room.activeQuestionId).first()
                                answer = question.example_answer
                                self.db.session.query(ChatRoom).filter_by(chatRoomId=room.chatRoomId).update(
                                    {"activeQuestionId": None})
                                self.db.session.commit()
                                # TODO: Reward correct users
                                self.correct_users[room.chatRoomId] = set()
                                self.room_counters[room.chatRoomId] = -room.type.config["new_question_timeout"] - 1
                                msg = {"roomId": room.chatRoomId, "question": question.questionText, "answer": answer}
                                self.socketio.emit("update_question", msg, room=room.chatRoomId)
                                print(f"Question ended in room {room.chatRoomId}. Answer: {answer}")
                                self.room_latest_updates[room.chatRoomId] = msg
                                pass
                            self.room_counters[room.chatRoomId] += 1
            except Exception as e:
                print("Error in game loop")
                print(e)
                pass

            time.sleep(1)

    def get_random_question(self):
        question = self.db.session.query(Question).order_by(func.random()).first()
        return question

    def process_message(self, room_id, username, message):
        with self.room_locks[room_id]:
            room = self.db.session.query(ChatRoom).filter_by(chatRoomId=room_id).first()
            if not room or not room.activeQuestionId:
                return False

            question = self.db.session.query(Question).filter_by(
                questionId=room.activeQuestionId).first()
            if not question:
                return False

            answers = self.db.session.query(Answer).filter_by(
                questionId=question.questionId).all()
            answer_texts = [ans.answerText.lower() for ans in answers]
            suggested_answer = message.strip().lower()

            if suggested_answer in answer_texts:
                self.correct_users[room.chatRoomId].add(username)
                end_type = room.type.config["end_type"]
                if end_type == 'instant':
                    self.room_counters[room.chatRoomId] = room.type.config.event_timers["end"] + 10
                return True
            return False

    def clue_empties(self, answer):
        clue = ''.join('_ ' if c != ' ' else '   ' for c in answer)
        clue = clue.strip()
        return clue

    def clue_first_letters(self, answer):
        if len(answer) == 1:
            return "_"
        words = answer.split(" ")
        if all(len(word) == 1 for word in words):
            return '_ ' * len(words).strip()

        clue = ''
        for word in words:
            clue += word[0] + ' ' + '_ ' * (len(word) - 1) + '   '

        return clue.strip()

    def clue_fifty_percent(self, s):
        """
        Generate a clue from a string following these rules:
        1. First letter of each word MUST be shown
        2. 50% of total letters shown (including first letters), if first letters > 50% show them anyway
        3. Non-shown letters replaced by _
        4. Empty spaces " " are preserved
        5. Additional letters to show are randomly selected

        Args:
            s (str): Input string

        Returns:
            str: Clue string with some letters hidden
        """
        if not s:
            return s
        if len(s) == 1:
            return "_"

        words = s.split(' ')

        # Calculate total letters (excluding spaces)
        total_letters = sum(len(word) for word in words)

        if total_letters == 0:
            return s

        # Count first letters that must be shown
        first_letters_count = len([word for word in words if word])  # non-empty words

        # Calculate how many letters to show (at least 50% or first letters if more)
        target_letters_to_show = max(first_letters_count, int(total_letters * 0.5))

        # Collect all non-first letter positions that could be shown
        available_positions = []
        pos_index = 0

        for word_idx, word in enumerate(words):
            if not word:
                continue
            for letter_idx in range(1, len(word)):  # skip first letter (index 0)
                available_positions.append((word_idx, letter_idx, pos_index))
                pos_index += 1

        # Randomly select additional positions to show
        additional_needed = target_letters_to_show - first_letters_count
        if additional_needed > 0 and available_positions:
            additional_needed = min(additional_needed, len(available_positions))
            selected_positions = random.sample(available_positions, additional_needed)
        else:
            selected_positions = []

        # Build result
        result_words = []
        for word_idx, word in enumerate(words):
            if not word:  # empty word (multiple spaces)
                result_words.append(word)
                continue

            word_result = list('_' * len(word))
            word_result[0] = word[0]  # First letter must be shown

            # Show randomly selected additional letters
            for sel_word_idx, sel_letter_idx, _ in selected_positions:
                if sel_word_idx == word_idx:
                    word_result[sel_letter_idx] = word[sel_letter_idx]

            result_words.append(' '.join(word_result))

        return '   '.join(result_words)
