from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import helper

x = datetime.datetime.now()

# Initializing flask app
app = Flask(__name__)
cors = CORS(app)

# Route for seeing a data
@app.route('/data')
def submit():
	print("Data received")
	doc1 = request.args.get('doc1')
	doc2 = request.args.get('doc2')
	# print(request)
	# print("Till here done")
	# doc1 = request.form['doc1']
	# doc2 = request.form['doc2']
	# response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
	simi = helper.getTotalSimilarity(doc1, doc2)
	lineWise = helper.getLineWiseSimilarity(doc1, doc2)
	
	return {
		"status": "success",
		"similarity": simi,
		"lineWise": lineWise
	}

# Running app
if __name__ == '__main__':
	app.run(debug=False, port=3001, host='0.0.0.0')
