from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model

app = Flask(__name__)

model = load_model("model.h5")

THRESHOLD = 0.05

@app.route('/')
def home():
    return "Running"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json['features']
    data = np.array(data).reshape(1, -1)

    reconstructed = model.predict(data)
    loss = np.mean((data - reconstructed) ** 2)

    if loss > THRESHOLD:
        result = "⚠️ Intrusion Detected"
    else:
        result = "✅ Normal Traffic"

    return jsonify({"message": result})

app.run()
