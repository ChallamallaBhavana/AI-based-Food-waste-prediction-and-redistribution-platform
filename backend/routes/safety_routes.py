from flask import Blueprint, request, jsonify
from database.db import SessionLocal
from models.food_safety import FoodSafety
from models.food_record import FoodRecord
from services.safety_service import SafetyService
from datetime import datetime

safety_bp = Blueprint('safety', __name__)

@safety_bp.route('/validate', methods=['POST'])
def validate_safety():
    data = request.get_json() or {}
    
    validation = SafetyService.validate_food_safety(data)
    
    # If food_id is provided, persist to food_safety table
    food_id = data.get('food_id')
    if food_id:
        db = SessionLocal()
        try:
            food = db.query(FoodRecord).filter_by(food_id=food_id).first()
            if food:
                prep_dt = None
                if data.get('preparation_time'):
                    try:
                        prep_dt = datetime.fromisoformat(str(data['preparation_time']).replace('Z', ''))
                    except Exception:
                        prep_dt = food.preparation_time

                exp_dt = None
                if data.get('expiry_time'):
                    try:
                        exp_dt = datetime.fromisoformat(str(data['expiry_time']).replace('Z', ''))
                    except Exception:
                        exp_dt = food.expiry_time

                safety_record = FoodSafety(
                    food_id=food.food_id,
                    preparation_time=prep_dt or food.preparation_time,
                    storage_condition=data.get('storage_condition', food.storage_condition or 'Room Temperature'),
                    expiry_time=exp_dt or food.expiry_time,
                    safety_status=validation['safety_status'],
                    validation_reason=validation['validation_reason']
                )
                db.add(safety_record)
                db.commit()
                validation['safety_id'] = safety_record.safety_id
        except Exception as e:
            db.rollback()
            print(f"Failed to persist safety validation: {e}")
        finally:
            db.close()

    return jsonify(validation), 200

@safety_bp.route('/rules', methods=['GET'])
def get_fssai_guidelines():
    return jsonify({
        'title': 'FSSAI Food Safety & Donation Reference Framework',
        'disclaimer': 'Guidelines implemented as application-level validation. Not an official FSSAI certification.',
        'standards': [
            {
                'category': 'Temperature Danger Zone',
                'rule': 'Bacterial proliferation accelerates between 5°C and 60°C.',
                'requirement': 'Hot food must be held at ≥ 60°C (preferably ≥ 63°C). Cold food must be chilled at ≤ 5°C.'
            },
            {
                'category': 'Ambient Holding (2-Hour / 4-Hour Rule)',
                'rule': 'Perishable cooked meals at room temperature.',
                'requirement': 'Safe for redistribution up to 2 hours. Between 2 to 4 hours requires immediate consumption without re-cooling. Over 4 hours cannot be redistributed.'
            },
            {
                'category': 'Cold Chain Holding',
                'rule': 'Refrigerated surplus meals (≤ 5°C).',
                'requirement': 'Safe within 24-36 hours from preparation. Strict reheat to boiling/steaming prior to distribution.'
            },
            {
                'category': 'Bakery and Dry Goods',
                'rule': 'Low moisture baked or grain products.',
                'requirement': 'Safe at dry room temperature for up to 24-48 hours depending on filling.'
            }
        ]
    })
