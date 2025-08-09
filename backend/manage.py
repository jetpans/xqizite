from models import app, db
from flask_migrate import init, migrate, upgrade

if __name__ == "__main__":
    with app.app_context():
        try:
            init()  # creates migrations folder (run only once)
        except Exception as e:
            print("Migrations folder already exists, skipping init.")

        migrate(message="Initial migration")  # generates migration script
        upgrade()  # applies migration to DB

        print("✅ Migration applied successfully!")