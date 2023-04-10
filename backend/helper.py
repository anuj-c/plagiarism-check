import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer, WordNetLemmatizer
import string
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
import pandas as pd
import numpy as np
from numpy.linalg import norm

# nltk.download('stopwords')
# nltk.download('punkt')
# nltk.download('wordnet')

stop_words = stopwords.words('english')
removing_words = ["don't", "aren't", "couldn't", "didn't", "doesn't", "hadn't", "hasn't", "haven't", "isn't", "mightn't", "mustn't", "needn't", "shan't", "shouldn't", "wasn't", "weren't", "won't", "wouldn't", "no", "nor", "not"]
for w in removing_words:
  stop_words.remove(w)
print("Stop Words formatted")

ps = PorterStemmer()

# print('Length: ',len(text1))
# print(text1)
# print('Length: ', len(text2))
# print(text2)

# TOKENIZATION
def preprocessing(text1, text2):
  words = word_tokenize(text1)
  words2 = word_tokenize(text2)
  # print(len(words))
  # print(words)
  # print(len(words2))
  # print(words2)

  osent = [
      text1.split('.'),
      text2.split('.')
  ]
  osent = [[s.strip() for s in sent] for sent in osent]

  lemmatizer = WordNetLemmatizer()
  words = [lemmatizer.lemmatize(w) for w in words]
  words2 = [lemmatizer.lemmatize(w) for w in words2]
  # print(words)
  # print(words2)

  words = [ps.stem(w) for w in words]
  words2 = [ps.stem(w) for w in words2]
  # print(words)
  # print(words2)

  body = [
      ' '.join(words),
      ' '.join(words2)
  ]
  # print(body)

  sentences = [
      body[0].split('.'),
      body[1].split('.')
  ]
  sentences = [[s.strip() for s in sent if s.strip() != ''] for sent in sentences]
  # print(sentences)
  return sentences, body, osent

def print_lsa(lsa, text1, text2):
  topic_encoded_df = pd.DataFrame(lsa, columns=["topic1", "topic2"])
  topic_encoded_df["body"] = [text1, text2]
  # display(topic_encoded_df[['body', 'topic1', 'topic2']])

def get_encoding_matrix(svd, vectorizer):
  dictionary = vectorizer.get_feature_names_out()
  encoding_matrix = pd.DataFrame(svd.components_, index=['topic1', 'topic2'], columns=dictionary).T
  return encoding_matrix

def term_importance(encoding_matrix):
  encoding_matrix['abs_topic1'] = np.abs(encoding_matrix['topic1'])
  encoding_matrix['abs_topic2'] = np.abs(encoding_matrix['topic2'])
  # display(encoding_matrix.sort_values(by=['abs_topic1'], ascending=False))
  # display(encoding_matrix.sort_values(by=['abs_topic2'], ascending=False))

def cosine_similarity(v1, v2):
  if norm(v1) == 0 or norm(v2)==0:
    return 0
  return np.dot(v1, v2) / (norm(v1) * norm(v2))

def get_similarity(text1, text2):
  vectorizer = TfidfVectorizer(min_df=1, stop_words=stop_words)
  bag_of_words = vectorizer.fit_transform([text1, text2])
  svd = TruncatedSVD(n_components=bag_of_words.shape[0])
  lsa = svd.fit_transform(bag_of_words)
  # print_lsa(lsa, text1, text2)
  return cosine_similarity(lsa[0], lsa[1])

def getTotalSimilarity(text1, text2):
  sentences, body, osent = preprocessing(text1, text2)
  vectorizer = TfidfVectorizer(min_df=1, stop_words=stop_words)
  bag_of_words = vectorizer.fit_transform(body)
  svd = TruncatedSVD(n_components=bag_of_words.shape[0])
  lsa = svd.fit_transform(bag_of_words)
  # print_lsa(lsa, text1, text2)
  similarity = cosine_similarity(lsa[0], lsa[1])
  similarity = round(similarity, 4)
  # print("The similarity percentage of the two documents = ",similarity*100)
  return similarity*100

def getLineWiseSimilarity(text1, text2):
  sentences, body, osent = preprocessing(text1, text2)
  txt = []
  for j, csen in enumerate(sentences[0]):
    maxs = 0
    idx = 0
    for i, s in enumerate(sentences[1]):
      temp = get_similarity(csen, s)
      if temp > maxs:
        maxs = temp
        idx = i
    txt.append([osent[0][j], round(maxs,4)*100, osent[1][idx]])
    # txt += osent[0][j] + '\n' + str(maxs) + '\n' + osent[1][idx] + '\n\n'
  # with open('t1.txt', 'w') as f:
  #   f.write(txt)
  return txt