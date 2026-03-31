"""
GuardianHealth - Heart Attack Risk Prediction Model
This module generates synthetic health data, trains a logistic regression model,
and exports the model weights for use in the backend prediction system.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import json
import warnings
warnings.filterwarnings('ignore')

def generate_synthetic_dataset(n_samples=1000):
    """
    Generate synthetic health dataset with realistic patterns

    Features:
    - age: 40-90 years
    - systolic_bp: 90-200 mmHg
    - diastolic_bp: 60-120 mmHg
    - heart_rate: 40-130 bpm

    Target:
    - risk_level: 0 (Low), 1 (Medium), 2 (High)
    """
    np.random.seed(42)

    # Generate base features
    age = np.random.randint(40, 91, n_samples)
    systolic_bp = np.random.randint(90, 201, n_samples)
    diastolic_bp = np.random.randint(60, 121, n_samples)
    heart_rate = np.random.randint(40, 131, n_samples)

    # Calculate risk scores based on medical knowledge
    risk_scores = []

    for i in range(n_samples):
        score = 0

        # Age factor (older = higher risk)
        if age[i] > 75:
            score += 3
        elif age[i] > 65:
            score += 2
        elif age[i] > 55:
            score += 1

        # Blood pressure factor
        if systolic_bp[i] >= 180 or diastolic_bp[i] >= 110:
            score += 4  # Hypertensive crisis
        elif systolic_bp[i] >= 160 or diastolic_bp[i] >= 100:
            score += 3  # Stage 2 hypertension
        elif systolic_bp[i] >= 140 or diastolic_bp[i] >= 90:
            score += 2  # Stage 1 hypertension
        elif systolic_bp[i] >= 130 or diastolic_bp[i] >= 80:
            score += 1  # Elevated

        # Heart rate factor
        if heart_rate[i] >= 120 or heart_rate[i] <= 45:
            score += 3  # Dangerous
        elif heart_rate[i] >= 100 or heart_rate[i] <= 50:
            score += 2  # Concerning
        elif heart_rate[i] >= 90 or heart_rate[i] <= 55:
            score += 1  # Elevated

        # Add some randomness for realistic variation
        score += np.random.randint(-1, 2)

        risk_scores.append(max(0, score))

    # Convert scores to risk levels
    risk_levels = []
    for score in risk_scores:
        if score >= 6:
            risk_levels.append(2)  # High risk
        elif score >= 3:
            risk_levels.append(1)  # Medium risk
        else:
            risk_levels.append(0)  # Low risk

    # Create DataFrame
    data = pd.DataFrame({
        'age': age,
        'systolic_bp': systolic_bp,
        'diastolic_bp': diastolic_bp,
        'heart_rate': heart_rate,
        'risk_level': risk_levels
    })

    return data

def train_model(data):
    """
    Train logistic regression model on health data

    Returns:
    - model: Trained LogisticRegression model
    - scaler: Fitted StandardScaler
    - X_test, y_test: Test data for evaluation
    """
    # Prepare features and target
    X = data[['age', 'systolic_bp', 'diastolic_bp', 'heart_rate']]
    y = data['risk_level']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train logistic regression model
    model = LogisticRegression(
        solver='lbfgs',
        max_iter=1000,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    return model, scaler, X_test_scaled, y_test

def evaluate_model(model, X_test, y_test):
    """
    Evaluate model performance and print metrics
    """
    # Make predictions
    y_pred = model.predict(X_test)

    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)

    # Print evaluation results
    print("=" * 60)
    print("GuardianHealth - Model Evaluation Results")
    print("=" * 60)
    print(f"\nModel Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("\nClassification Report:")
    print("-" * 60)
    target_names = ['Low Risk', 'Medium Risk', 'High Risk']
    print(classification_report(y_test, y_pred, target_names=target_names))

    print("\nConfusion Matrix:")
    print("-" * 60)
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    print("\n" + "=" * 60)

    return accuracy

def export_model_weights(model, scaler, accuracy, filename='model_weights.json'):
    """
    Export model weights, intercept, and scaler parameters to JSON file
    """
    # Extract model parameters
    weights = model.coef_.tolist()  # Shape: (3, 4) for 3 classes, 4 features
    intercept = model.intercept_.tolist()  # Shape: (3,)

    # Extract scaler parameters
    scaler_mean = scaler.mean_.tolist()
    scaler_scale = scaler.scale_.tolist()

    # Create weights dictionary
    model_data = {
        'model_type': 'logistic_regression',
        'multi_class': 'multinomial',
        'n_features': 4,
        'n_classes': 3,
        'feature_names': ['age', 'systolic_bp', 'diastolic_bp', 'heart_rate'],
        'class_names': ['Low Risk', 'Medium Risk', 'High Risk'],
        'weights': weights,
        'intercept': intercept,
        'scaler_mean': scaler_mean,
        'scaler_scale': scaler_scale,
        'accuracy': float(accuracy),
        'description': 'Heart attack risk prediction model for GuardianHealth'
    }

    # Save to JSON file
    with open(filename, 'w') as f:
        json.dump(model_data, f, indent=2)

    print(f"\n✓ Model weights exported to '{filename}'")
    print(f"✓ Model ready for backend integration")

def main():
    """
    Main function to generate data, train model, and export weights
    """
    print("\n" + "=" * 60)
    print("GuardianHealth - Heart Attack Risk Prediction Model Training")
    print("=" * 60)

    # Step 1: Generate synthetic dataset
    print("\n[1/4] Generating synthetic health dataset...")
    data = generate_synthetic_dataset(n_samples=1500)
    print(f"✓ Generated {len(data)} health records")
    print(f"✓ Risk distribution:")
    print(data['risk_level'].value_counts().sort_index())

    # Step 2: Train model
    print("\n[2/4] Training logistic regression model...")
    model, scaler, X_test, y_test = train_model(data)
    print("✓ Model trained successfully")

    # Step 3: Evaluate model
    print("\n[3/4] Evaluating model performance...")
    accuracy = evaluate_model(model, X_test, y_test)

    # Step 4: Export model weights
    print("\n[4/4] Exporting model weights...")
    export_model_weights(model, scaler, accuracy)

    print("\n" + "=" * 60)
    print("Model Training Complete!")
    print("=" * 60)
    print("\nNext Steps:")
    print("1. Run 'python backend.py' to start the Flask server")
    print("2. Open 'index.html' in a web browser")
    print("3. Start monitoring health and making predictions")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
