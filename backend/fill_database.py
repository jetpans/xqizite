import pandas as pd
from text_to_num import text2num
import numerizer
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
import nltk
import textacy.preprocessing as tp
import contractions
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

    if len(alternatives) > 0:
        print("Alternatives for '{}': {}".format(answer, alternatives))


