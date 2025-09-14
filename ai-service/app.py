from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_generator import AIGenerator

app = Flask(__name__)
CORS(app)

generator = AIGenerator()

@app.route("/")
def home():
    return "AI Service is running!"

@app.route("/api/generate", methods=["POST"])
def generate_response():
    data = request.get_json()
    question = data.get("question")

    if not question:
        return jsonify({"error": "Question is required"}), 400

    result = generator.generate(question)
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5001, debug=True)