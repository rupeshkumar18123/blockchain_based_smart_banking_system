from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import IsolationForest

app = Flask(__name__)
CORS(app)  # Allow React to talk to this Python server

# --- 1. TRAIN THE AI MODEL (Simulation) ---
# We train it on startup for this demo.
# "Normal" behavior: Small transactions between 0.1 and 10 ETH.
print("🧠 Training AI Fraud Model...")
rng = np.random.RandomState(42)
X_train = 0.1 + 10 * rng.uniform(size=(100, 1)) # 100 normal transactions
clf = IsolationForest(random_state=42, contamination=0.1)
clf.fit(X_train)
print("✅ AI Model Ready!")

# --- 2. API ENDPOINT ---
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    amount = float(data.get('amount'))
    
    # Predict: 1 = Normal, -1 = Anomaly
    prediction = clf.predict([[amount]])[0]
    
    # RULE OVERRIDE: Force "Fraud" if amount > 50 ETH (for easy testing)
    if amount > 50:
        prediction = -1

    if prediction == -1:
        print(f"🚨 ALERT: Fraud detected for {amount} ETH")
        return jsonify({"result": "FRAUD", "message": "Unusual transaction amount detected!"})
    else:
        print(f"✅ Safe: Transaction of {amount} ETH approved")
        return jsonify({"result": "SAFE", "message": "Transaction verified."})

if __name__ == '__main__':
    app.run(port=5000)