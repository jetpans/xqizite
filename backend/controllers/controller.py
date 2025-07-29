from flask_sqlalchemy import SQLAlchemy

class Controller:
    def __init__(self, app, db, jwt):
        self.db = db
        self.app = app
        self.jwt = jwt