from flask import Blueprint, request, jsonify
from database.db import SessionLocal
from models.prediction import Prediction
from models.food_record import FoodRecord
from services.ml_service import MLService
from utils.auth_middleware import jwt_required

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/calculate', methods=['POST'])
def calculate_prediction():
    """
    Takes food metrics and returns predicted surplus, demand level, and waste risk.
    Does not require authentication so testing/demo is seamless.
    """
    data = request.get_json() or {}
    if not data.get('quantity_prepared'):
        return jsonify({'error': 'quantity_prepared is required.'}), 400

    result = MLService.predict_surplus(data)
    
    # If food_id is provided, optionally persist the prediction
    food_id = data.get('food_id')
    if food_id:
        db = SessionLocal()
        try:
            food = db.query(FoodRecord).filter_by(food_id=food_id).first()
            if food:
                pred_entry = Prediction(
                    food_id=food.food_id,
                    predicted_surplus=result['predicted_surplus'],
                    demand_level=result['demand_level'],
                    waste_risk=result['waste_risk'],
                    confidence=result['confidence']
                )
                db.add(pred_entry)
                db.commit()
                result['prediction_id'] = pred_entry.prediction_id
        except Exception as e:
            db.rollback()
            print(f"Error saving prediction: {e}")
        finally:
            db.close()

    return jsonify(result), 200

@predict_bp.route('/history', methods=['GET'])
@jwt_required()
def get_prediction_history():
    db = SessionLocal()
    try:
        preds = db.query(Prediction).order_by(Prediction.prediction_date.desc()).limit(20).all()
        return jsonify([p.to_dict() for p in preds]), 200
    finally:
        db.close()
