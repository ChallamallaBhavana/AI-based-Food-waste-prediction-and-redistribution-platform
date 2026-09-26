import datetime
from flask import Blueprint, request, jsonify, g
from database.db import SessionLocal
from models.food_record import FoodRecord
from models.restaurant import Restaurant
from models.prediction import Prediction
from models.food_safety import FoodSafety
from services.ml_service import MLService
from services.safety_service import SafetyService
from utils.auth_middleware import jwt_required

food_bp = Blueprint('food', __name__)

@food_bp.route('/entry', methods=['POST'])
@jwt_required(allowed_roles=['restaurant', 'admin'])
def create_food_entry():
    data = request.get_json() or {}
    
    food_name = data.get('food_name', '').strip()
    if not food_name:
        return jsonify({'error': 'Food name is required.'}), 400

    try:
        qty_prepared = float(data.get('quantity_prepared', 0))
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid quantity_prepared value.'}), 400

    qty_sold = float(data.get('quantity_sold', 0))
    
    # Calculate surplus
    surplus_qty = data.get('surplus_quantity')
    if surplus_qty is not None and str(surplus_qty).strip() != '':
        surplus_qty = float(surplus_qty)
    else:
        surplus_qty = max(0.0, qty_prepared - qty_sold)

    # Date / Time
    date_str = data.get('date') or datetime.date.today().isoformat()
    prep_time_str = data.get('preparation_time')
    if prep_time_str:
        try:
            prep_time = datetime.datetime.fromisoformat(prep_time_str.replace('Z', ''))
        except Exception:
            prep_time = datetime.datetime.utcnow()
    else:
        prep_time = datetime.datetime.utcnow()

    exp_time_str = data.get('expiry_time')
    if exp_time_str:
        try:
            exp_time = datetime.datetime.fromisoformat(exp_time_str.replace('Z', ''))
        except Exception:
            exp_time = prep_time + datetime.timedelta(hours=6)
    else:
        exp_time = prep_time + datetime.timedelta(hours=6)

    food_type = data.get('food_type', 'Cooked Meal')
    weather = data.get('weather', 'Sunny')
    festival = data.get('festival', 'None')
    storage = data.get('storage_condition', 'Room Temperature')
    temperature = data.get('temperature', 25.0)

    db = SessionLocal()
    try:
        # Determine restaurant_id
        rest_id = data.get('restaurant_id')
        if not rest_id:
            restaurant = db.query(Restaurant).filter_by(user_id=g.current_user.user_id).first()
            if not restaurant:
                # Fallback: create or find first restaurant
                restaurant = db.query(Restaurant).first()
                if not restaurant:
                    restaurant = Restaurant(
                        user_id=g.current_user.user_id,
                        restaurant_name=f"{g.current_user.name}'s Restaurant",
                        location='Central City'
                    )
                    db.add(restaurant)
                    db.flush()
            rest_id = restaurant.restaurant_id

        # 1. Create Food Record
        food_rec = FoodRecord(
            restaurant_id=rest_id,
            food_name=food_name,
            food_type=food_type,
            quantity_prepared=qty_prepared,
            quantity_sold=qty_sold,
            surplus_quantity=surplus_qty,
            preparation_time=prep_time,
            expiry_time=exp_time,
            weather=weather,
            festival=festival,
            storage_condition=storage,
            temperature=temperature
        )
        db.add(food_rec)
        db.flush()

        # 2. Run ML Prediction
        ml_input = {
            'food_name': food_name,
            'food_type': food_type,
            'quantity_prepared': qty_prepared,
            'previous_demand': data.get('previous_demand', qty_prepared * 0.8),
            'date': date_str,
            'weather': weather,
            'festival': festival
        }
        ml_result = MLService.predict_surplus(ml_input)
        
        prediction = Prediction(
            food_id=food_rec.food_id,
            predicted_surplus=ml_result['predicted_surplus'],
            demand_level=ml_result['demand_level'],
            waste_risk=ml_result['waste_risk'],
            confidence=ml_result['confidence']
        )
        db.add(prediction)

        # 3. Run Food Safety Validation
        safety_input = {
            'food_name': food_name,
            'food_type': food_type,
            'preparation_time': prep_time,
            'storage_condition': storage,
            'expiry_time': exp_time,
            'temperature': temperature
        }
        safety_res = SafetyService.validate_food_safety(safety_input)

        safety_record = FoodSafety(
            food_id=food_rec.food_id,
            preparation_time=prep_time,
            storage_condition=storage,
            expiry_time=exp_time,
            safety_status=safety_res['safety_status'],
            validation_reason=safety_res['validation_reason']
        )
        db.add(safety_record)

        db.commit()

        response_data = food_rec.to_dict()
        response_data['prediction'] = prediction.to_dict()
        response_data['safety'] = safety_record.to_dict()
        response_data['safety']['reasons_list'] = safety_res['reasons_list']

        return jsonify({
            'message': 'Daily food record created and evaluated successfully.',
            'food': response_data
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({'error': f'Failed to process food entry: {str(e)}'}), 500
    finally:
        db.close()

@food_bp.route('/records', methods=['GET'])
@jwt_required()
def list_food_records():
    db = SessionLocal()
    try:
        query = db.query(FoodRecord)
        if g.current_user.role == 'restaurant':
            rest = db.query(Restaurant).filter_by(user_id=g.current_user.user_id).first()
            if rest:
                query = query.filter_by(restaurant_id=rest.restaurant_id)

        records = query.order_by(FoodRecord.created_at.desc()).all()
        results = []
        for r in records:
            d = r.to_dict()
            # Attach latest prediction and safety
            if r.predictions:
                d['prediction'] = r.predictions[-1].to_dict()
            if r.food_safeties:
                d['safety'] = r.food_safeties[-1].to_dict()
            d['donation_count'] = len(r.donations)
            results.append(d)

        return jsonify(results), 200
    finally:
        db.close()

@food_bp.route('/record/<int:food_id>', methods=['GET'])
@jwt_required()
def get_food_record(food_id):
    db = SessionLocal()
    try:
        rec = db.query(FoodRecord).filter_by(food_id=food_id).first()
        if not rec:
            return jsonify({'error': 'Food record not found.'}), 404

        d = rec.to_dict()
        d['predictions'] = [p.to_dict() for p in rec.predictions]
        d['safeties'] = [s.to_dict() for s in rec.food_safeties]
        d['donations'] = [don.to_dict() for don in rec.donations]
        return jsonify(d), 200
    finally:
        db.close()

@food_bp.route('/record/<int:food_id>', methods=['DELETE'])
@jwt_required(allowed_roles=['restaurant', 'admin'])
def delete_food_record(food_id):
    db = SessionLocal()
    try:
        rec = db.query(FoodRecord).filter_by(food_id=food_id).first()
        if not rec:
            return jsonify({'error': 'Record not found.'}), 404

        db.delete(rec)
        db.commit()
        return jsonify({'message': 'Food record deleted successfully.'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
