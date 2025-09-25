
from flask import Flask, jsonify, request, render_template, redirect, url_for, session
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
import re
import uuid
from dotenv import load_dotenv
from controllers.controller import Controller
import logging
from models import Account
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, \
    unset_jwt_cookies, jwt_required, JWTManager
from datetime import timedelta

from flask_mail import Mail, Message

class AuthController(Controller):
    def __init__(self, app, db, bcrypt, jwt):
        super().__init__(app, db, jwt)
        self.bcrypt = bcrypt

        self.app.add_url_rule("/register", view_func=self.register, methods=["POST"])
        self.app.add_url_rule("/login", view_func=self.login, methods=["POST"])
        self.app.add_url_rule("/logout", view_func=self.logout, methods=["POST", "GET"])
        self.app.add_url_rule("/updateProfile", view_func=self.update, methods=["POST"])

        self.email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        self.password_regex = "^(?=.*?[a-z])(?=.*?[0-9]).{6,}$"
        self.username_regex = r"^[A-Za-z0-9]{6,}$"
        self.REGISTER_REQUIRED_FIELDS = ["email", "username", "password"]
        self.LOGIN_REQUIRED_FIELDS = ["email", "username", "password", "roleId", "profileImage", ]

    @jwt_required()
    def update(self):
        try:

            current_user = get_jwt_identity()
        except Exception as e:
            return {"success": False, "data": "Not logged in."}

        data = request.get_json()
        user, new_avatar = data.get("username"), data.get("avatar")
        if not user or not new_avatar:
            return {"success": False, "data": "Missing username or avatar."}
        if not user == current_user:
            return {"success": False, "data": "You can only update your own profile."}

        if not new_avatar.startswith("https://avataaars.io"):
            return {"success": False, "data": "Avatar must be a valid URL."}

        acc = self.db.session.query(Account).filter_by(username=user).first()
        if not acc:
            return {"success": False, "data": "User not found."}
        if acc.type == "guest":
            return {"success": False, "data": "Guest users cannot update profile."}

        acc.avatar = new_avatar
        self.db.session.commit()
        # print(f"Updated avatar for user {user} to {new_avatar}")
        return {"success": True, "data": "Profile updated."}

    def register(self):
        data = request.get_json()
        result = self.testRegForm(data)
        # print(f"Result is {data}")
        if result == "OK":
            passwordHash = self.bcrypt.generate_password_hash(data["password"]).decode("utf-8")
            f = data
            if "avatar" in f and f["avatar"] is not None and f["avatar"] != "":
                if not f["avatar"].startswith("https://avataaars.io"):
                    return {"success": False, "data": "Avatar must be a valid URL."}

            newAcc = Account(f["username"], passwordHash, f["email"], avatar=f.get("avatar", None))
            self.db.session.add(newAcc)
            self.db.session.commit()
            self.db.session.commit()
            return {"success": True, "data": "Registration successful."}

        return result

    def login(self):
        data = request.get_json()
        if data.get("guest", False):
            acc = self.db.session.query(Account).filter_by(username=data["username"]).first()
            if acc:
                return {"success": False, "data": "Username already in use."}
            if "avatar" in data and data["avatar"] is not None and data["avatar"] != "":
                if not data["avatar"].startswith("https://avataaars.io"):
                    return {"success": False, "data": "Avatar must be a valid URL."}
            myUser = Account(username=data["username"], avatar=data.get("avatar", None))
            # print("Guest login, avatar:", data.get("avatar", None))
            access_token = create_access_token(identity=myUser.username, additional_claims={
            }, expires_delta=timedelta(hours=1))
            user = {
                "id": myUser.accountId,
                "username": myUser.username,
                "avatar": myUser.avatar,
                "email": myUser.eMail,
                "guest": True
            }

            resp = {"success": True, "data": {"user": user, "access_token": access_token}}
            # resp.set_cookie("username", myUser.username)
            self.db.session.add(myUser)
            self.db.session.commit()
            return resp

        result = self.testLoginForm(data)

        if result == "OK":
            myUser = self.db.session.query(Account).filter_by(username=data["username"]).first()
            if not myUser:
                return {"success": False, "data": "Wrong credentials."}
            userHashedPassword = myUser.passwordHash
            isCorrect = self.bcrypt.check_password_hash(userHashedPassword, data["password"])
            if (isCorrect):

                access_token = create_access_token(identity=myUser.username, additional_claims={
                }, expires_delta=timedelta(hours=1))
                user = {
                    "id": myUser.accountId,
                    "username": myUser.username,
                    "email": myUser.eMail,
                    "avatar": myUser.avatar,
                    "guest": False
                }

                resp = {"success": True, "data": {"user": user, "access_token": access_token}}
                # resp.set_cookie("username", myUser.username)
                return resp
            else:
                return {"success": False, "data": "Wrong credentials."}
        else:
            return result

    def logout(self):
        response = {"success": True, "data": "Logout successful."}

        try:
            unset_jwt_cookies(response)
        except:
            pass
        return response

    def testRegForm(self, form):
        for k in self.REGISTER_REQUIRED_FIELDS:
            if k not in form.keys():
                return {"success": False, "data": f"{k} argument is missing!"}

        if not re.match(self.email_regex, form["email"]):
            return {"success": False, "data": "Mail is of wrong format."}

        if not re.match(self.password_regex, form["password"]):
            return {"success": False, "data": "Password is bad."}

        if not re.match(self.username_regex, form["username"]):
            return {"success": False, "data": "Username is too short or too long."}

        if form["username"] in list(map(lambda x: x[0], self.db.session.query(Account.username).all())):
            return {"success": False, "data": "Username already in use."}

        return "OK"

    def testLoginForm(self, form):
        if "username" not in form.keys() or "password" not in form.keys():
            {"success": False, "data": "Missing a field in login package."}
        if form["username"] not in list(map(lambda x: x[0], self.db.session.query(Account.username).all())):
            {"success": False, "data": "Wrong credentials."}
        return "OK"
