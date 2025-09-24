import pandas as pd
from text_to_num import text2num
import numerizer
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
import nltk
import textacy.preprocessing as tp
import contractions


from flask import Flask, render_template, request
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from config import DevelopmentConfig, ProductionConfig
from flask_migrate import migrate, init, upgrade, Migrate
import uuid
from models import Answer, Question

load_dotenv()
app = Flask(__name__)
env = os.environ.get('FLASK_ENV')

if env == 'production':
    app.config.from_object(ProductionConfig)
else:
    app.config.from_object(DevelopmentConfig)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DB_CONNECT_URL_PROD")
print(f"Using database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
db = SQLAlchemy(app)


if __name__ == "__main__":
    with app.app_context():
        # db.session.query(Question).delete()
        # db.session.commit()
        # exit(1)
        print("Starting to read CSV file...")
        data = pd.read_csv('data/trivia.csv')

        nltk.download('wordnet')
        lemmatizer = WordNetLemmatizer()

        for index, row in data.iterrows():
            question, answer = row['question'], row['answers']
            answer = answer.strip().lower()
            alternatives = set()
            try:
                alt = text2num(answer, lang='en')

                if alt != answer:
                    alternatives.add(str(alt))
                if len(answer.split(" ")) == 1:
                    alt2 = alt.replace("st", "").replace("nd", "").replace("rd", "").replace("th", "")
                    if alt2 != answer:
                        alternatives.add(alt2)

            except Exception as e:
                pass

            try:
                alt = numerizer.numerize(answer)
                if alt != answer:
                    alternatives.add(str(alt))
            except Exception as e:
                pass

            try:
                lemma = lemmatizer.lemmatize(answer)
                if lemma != answer:
                    alternatives.add(lemma)
            except Exception as e:
                pass

            try:
                alt = tp.normalize.unicode(answer)
                if alt != answer:
                    alternatives.add(alt)
            except Exception as e:
                print(e)
                pass

            try:
                alt = contractions.fix(answer)
                if alt != answer:
                    alternatives.add(alt)
            except Exception as e:
                print(e)
                pass

            alternatives.add(answer)
            try:
                q = Question(question, answer)
                db.session.add(q)
                db.session.flush()
                if len(alternatives) > 0:
                    print("Alternatives for '{}': {}".format(answer, alternatives))
                    
                    answrs = [Answer(questionId=q.questionId, answerText=answer.lower()) for answer in alternatives]
                    db.session.add_all(answrs)
                    db.session.commit()
            except:
                pass






