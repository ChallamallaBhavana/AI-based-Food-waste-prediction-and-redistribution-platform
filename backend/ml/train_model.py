import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import r2_score, mean_absolute_error, accuracy_score
from dataset_generator import generate_food_waste_dataset

def train_and_save_model():
    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, 'food_waste_dataset.csv')
    model_path = os.path.join(base_dir, 'surplus_model.joblib')

    if not os.path.exists(csv_path):
        print("Dataset not found. Generating fresh dataset...")
        df = generate_food_waste_dataset(num_samples=3000, output_path=csv_path)
    else:
        df = pd.read_csv(csv_path)

    print(f"Loaded dataset with {len(df)} samples.")

    # Features
    feature_cols = [
        'food_name', 'food_type', 'quantity_prepared', 'previous_demand',
        'day_of_week', 'is_weekend', 'weather', 'festival'
    ]
    
    categorical_cols = ['food_name', 'food_type', 'weather', 'festival']
    numerical_cols = ['quantity_prepared', 'previous_demand', 'day_of_week', 'is_weekend']

    X = df[feature_cols]
    y_surplus = df['surplus_quantity']
    y_risk = df['waste_risk']

    # Preprocessing
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols)
        ]
    )

    # Train-test split
    X_train, X_test, y_s_train, y_s_test, y_r_train, y_r_test = train_test_split(
        X, y_surplus, y_risk, test_size=0.2, random_state=42
    )

    # 1. Regressor for Surplus Quantity
    regressor = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
    ])
    regressor.fit(X_train, y_s_train)

    y_s_pred = regressor.predict(X_test)
    r2 = r2_score(y_s_test, y_s_pred)
    mae = mean_absolute_error(y_s_test, y_s_pred)
    print(f"[ML Evaluation] Surplus Regressor R2 Score: {r2:.4f} | MAE: {mae:.2f} kg")

    # 2. Classifier for Waste Risk
    classifier = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('model', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
    ])
    classifier.fit(X_train, y_r_train)

    y_r_pred = classifier.predict(X_test)
    acc = accuracy_score(y_r_test, y_r_pred)
    print(f"[ML Evaluation] Waste Risk Classifier Accuracy: {acc * 100:.2f}%")

    # Save artifacts
    artifacts = {
        'regressor': regressor,
        'classifier': classifier,
        'feature_cols': feature_cols,
        'metrics': {
            'r2_score': round(r2, 4),
            'mae': round(mae, 2),
            'accuracy': round(acc, 4)
        }
    }

    joblib.dump(artifacts, model_path)
    print(f"Model artifact successfully saved to: {model_path}")
    return artifacts

if __name__ == '__main__':
    train_and_save_model()
