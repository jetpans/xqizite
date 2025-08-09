
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

        self.email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
        self.password_regex = "^(?=.*?[a-z])(?=.*?[0-9]).{6,}$"
        self.REGISTER_REQUIRED_FIELDS = ["email", "username", "password"]
        self.LOGIN_REQUIRED_FIELDS = ["email", "username", "password", "roleId", "profileImage", ]
        self.username_range = (6, 20)

    def register(self):
        data = request.get_json()
        result = self.testRegForm(data)
        print(f"Result is {data}")
        if result == "OK":
            passwordHash = self.bcrypt.generate_password_hash(data["password"]).decode("utf-8")
            f = data
            newAcc = Account(f["username"], passwordHash, f["email"])
            self.db.session.add(newAcc)
            self.db.session.commit()
            self.db.session.commit()
            return {"success": True, "data": "Registration successful."}

        return result

    def login(self):
        data = request.get_json()
        if data.get("guest", False):
            myUser = Account()
            access_token = create_access_token(identity=myUser.username, additional_claims={
            }, expires_delta=timedelta(hours=1))
            user = {
                "id": myUser.accountId,
                "username": myUser.username,
                "email": myUser.eMail,
            }

            resp = {"success": True, "data": {"user": user, "access_token": access_token}}
            # resp.set_cookie("username", myUser.username)
            self.db.session.add(myUser)
            self.db.session.commit()
            return resp

        result = self.testLoginForm(data)

        if result == "OK":
            myUser = self.db.session.query(Account).filter_by(username=data["username"]).first()
            userHashedPassword = myUser.passwordHash
            isCorrect = self.bcrypt.check_password_hash(userHashedPassword, data["password"])
            if (isCorrect):

                access_token = create_access_token(identity=myUser.username, additional_claims={
                }, expires_delta=timedelta(hours=1))
                user = {
                    "id": myUser.accountId,
                    "username": myUser.username,
                    "email": myUser.eMail,
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

        if len(form["username"]) < self.username_range[0] or len(form["username"]) > self.username_range[1]:
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
