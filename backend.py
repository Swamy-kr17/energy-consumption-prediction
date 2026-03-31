"""
GuardianHealth - Flask Backend API
Provides health risk prediction endpoint with manual logistic regression implementation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

# Global variable to store model weights
MODEL_DATA = None

def load_model_weights(filename='model_weights.json'):
    """
    Load model weights from JSON file
    """
    global MODEL_DATA
    try:
        with open(filename, 'r') as f:
            MODEL_DATA = json.load(f)
        print("✓ Model weights loaded successfully")
        print(f"  - Model type: {MODEL_DATA['model_type']}")
        print(f"  - Accuracy: {MODEL_DATA['accuracy']:.2%}")
        print(f"  - Features: {', '.join(MODEL_DATA['feature_names'])}")
        print(f"  - Classes: {', '.join(MODEL_DATA['class_names'])}")
        return True
    except FileNotFoundError:
        print("✗ Error: model_weights.json not found")
        print("  Please run 'python heart_model.py' first to train the model")
        return False
    except Exception as e:
        print(f"✗ Error loading model weights: {e}")
        return False

def apply_safety_rules(age, systolic_bp, diastolic_bp, heart_rate):
    """
    Apply rule-based safety overrides for critical conditions

    Returns:
    - override (bool): Whether to override model prediction
    - risk_level (str): Forced risk level if override is True
    - reason (str): Reason for override
    """
    # Rule 1: Extremely high blood pressure (Hypertensive crisis)
    if systolic_bp >= 180 or diastolic_bp >= 110:
        return True, "High", f"Hypertensive crisis detected (BP: {systolic_bp}/{diastolic_bp})"

    # Rule 2: Very high blood pressure
    if systolic_bp >= 170:
        return True, "High", f"Severely elevated systolic BP: {systolic_bp} mmHg"

    # Rule 3: Dangerous heart rate - too high
    if heart_rate >= 120:
        return True, "High", f"Tachycardia detected (HR: {heart_rate} bpm)"

    # Rule 4: Dangerous heart rate - too low (Bradycardia)
    if heart_rate <= 45:
        return True, "High", f"Bradycardia detected (HR: {heart_rate} bpm)"

    # Rule 5: Combined risk - high BP and abnormal HR
    if (systolic_bp >= 160 or diastolic_bp >= 100) and (heart_rate >= 100 or heart_rate <= 55):
        return True, "High", f"Combined risk: High BP and abnormal HR"

    # Rule 6: Elderly with elevated vital signs
    if age >= 75 and systolic_bp >= 150 and heart_rate >= 95:
        return True, "High", f"Elderly patient with elevated vital signs"

    return False, None, None

def softmax(z):
    """
    Compute softmax function for multi-class probabilities
    """
    exp_z = np.exp(z - np.max(z))  # Subtract max for numerical stability
    return exp_z / np.sum(exp_z)

def predict_risk(age, systolic_bp, diastolic_bp, heart_rate):
    """
    Manual logistic regression prediction implementation

    Steps:
    1. Standardize input features using scaler parameters
    2. Compute logits: z = X * weights + intercept
    3. Apply softmax to get probabilities
    4. Select class with highest probability
    5. Apply safety rule overrides

    Returns:
    - risk_level: "Low", "Medium", or "High"
    - probability: Confidence of prediction (0-1)
    - probabilities: Probability for each class
    - override_applied: Whether safety rules were triggered
    - override_reason: Reason for override (if applicable)
    """
    if MODEL_DATA is None:
        raise ValueError("Model weights not loaded")

    # Step 1: Apply safety rules first
    override, override_risk, override_reason = apply_safety_rules(
        age, systolic_bp, diastolic_bp, heart_rate
    )

    # Step 2: Prepare input features
    features = np.array([age, systolic_bp, diastolic_bp, heart_rate])

    # Step 3: Standardize features (z-score normalization)
    scaler_mean = np.array(MODEL_DATA['scaler_mean'])
    scaler_scale = np.array(MODEL_DATA['scaler_scale'])
    features_scaled = (features - scaler_mean) / scaler_scale

    # Step 4: Compute logits for each class
    # z = X * W^T + b (for each class)
    weights = np.array(MODEL_DATA['weights'])  # Shape: (3, 4)
    intercept = np.array(MODEL_DATA['intercept'])  # Shape: (3,)

    logits = np.dot(weights, features_scaled) + intercept  # Shape: (3,)

    # Step 5: Apply softmax to get probabilities
    probabilities = softmax(logits)

    # Step 6: Get prediction
    predicted_class = np.argmax(probabilities)
    predicted_probability = probabilities[predicted_class]

    # Step 7: Map class index to risk level
    risk_level = MODEL_DATA['class_names'][predicted_class]

    # Step 8: Apply override if safety rules triggered
    if override:
        # Find index of override risk level
        override_class = MODEL_DATA['class_names'].index(override_risk)
        return {
            'risk_level': override_risk,
            'probability': float(probabilities[override_class]),
            'probabilities': {
                'Low': float(probabilities[0]),
                'Medium': float(probabilities[1]),
                'High': float(probabilities[2])
            },
            'override_applied': True,
            'override_reason': override_reason,
            'model_prediction': risk_level,
            'model_probability': float(predicted_probability)
        }

    return {
        'risk_level': risk_level,
        'probability': float(predicted_probability),
        'probabilities': {
            'Low': float(probabilities[0]),
            'Medium': float(probabilities[1]),
            'High': float(probabilities[2])
        },
        'override_applied': False,
        'override_reason': None
    }

@app.route('/')
def home():
    """
    API home endpoint
    """
    return jsonify({
        'service': 'GuardianHealth API',
        'version': '1.0.0',
        'status': 'active',
        'endpoints': {
            '/predict': 'POST - Predict heart attack risk',
            '/health': 'GET - Check API health'
        }
    })

@app.route('/health')
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'model_loaded': MODEL_DATA is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict heart attack risk based on health parameters

    Expected JSON input:
    {
        "age": 65,
        "systolic_bp": 140,
        "diastolic_bp": 90,
        "heart_rate": 85
    }

    Returns JSON with risk prediction
    """
    try:
        # Get JSON data from request
        data = request.get_json()

        # Validate required fields
        required_fields = ['age', 'systolic_bp', 'diastolic_bp', 'heart_rate']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400

        # Extract parameters
        age = float(data['age'])
        systolic_bp = float(data['systolic_bp'])
        diastolic_bp = float(data['diastolic_bp'])
        heart_rate = float(data['heart_rate'])

        # Validate ranges
        if not (0 <= age <= 120):
            return jsonify({'error': 'Age must be between 0 and 120'}), 400
        if not (50 <= systolic_bp <= 250):
            return jsonify({'error': 'Systolic BP must be between 50 and 250'}), 400
        if not (30 <= diastolic_bp <= 150):
            return jsonify({'error': 'Diastolic BP must be between 30 and 150'}), 400
        if not (30 <= heart_rate <= 200):
            return jsonify({'error': 'Heart rate must be between 30 and 200'}), 400

        # Make prediction
        result = predict_risk(age, systolic_bp, diastolic_bp, heart_rate)

        # Add input parameters to response
        result['input'] = {
            'age': age,
            'systolic_bp': systolic_bp,
            'diastolic_bp': diastolic_bp,
            'heart_rate': heart_rate
        }

        return jsonify(result)

    except ValueError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("GuardianHealth Backend API Server")
    print("=" * 60)

    # Load model weights
    if load_model_weights():
        print("\n" + "=" * 60)
        print("Starting Flask server...")
        print("API running at: http://localhost:5000")
        print("=" * 60)
        print("\nAvailable endpoints:")
        print("  GET  / - API information")
        print("  GET  /health - Health check")
        print("  POST /predict - Risk prediction")
        print("\nPress Ctrl+C to stop the server")
        print("=" * 60 + "\n")

        # Start Flask server
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("\n✗ Failed to start server - model weights not loaded")
        print("  Please run 'python heart_model.py' first")
