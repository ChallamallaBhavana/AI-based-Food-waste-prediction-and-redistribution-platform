from flask import Blueprint, request, jsonify, g
from database.db import SessionLocal
from models.ngo import NGO
from models.food_record import FoodRecord
from models.restaurant import Restaurant
from services.recommendation_service import RecommendationService
from utils.auth_middleware import jwt_required

ngo_bp = Blueprint('ngos', __name__)

@ngo_bp.route('', methods=['GET'])
def list_ngos():
    db = SessionLocal()
    try:
        ngos = db.query(NGO).all()
        return jsonify([ngo.to_dict() for ngo in ngos]), 200
    finally:
        db.close()

@ngo_bp.route('/recommendations', methods=['GET', 'POST'])
def get_recommendations():
    """
    Accepts surplus parameters via GET query params or POST body:
    - surplus_quantity (float)
    - food_name (str)
    - food_type (str)
    - food_id (optional, looks up restaurant location automatically)
    - latitude, longitude (optional user coords)
    """
    if request.method == 'POST':
        data = request.get_json() or {}
    else:
        data = request.args.to_dict()

    surplus_qty = float(data.get('surplus_quantity', 25.0))
    food_name = data.get('food_name', 'Cooked Meal')
    food_type = data.get('food_type', 'Cooked Meal')
    lat = data.get('latitude')
    lng = data.get('longitude')

    db = SessionLocal()
    try:
        food_id = data.get('food_id')
        if food_id:
            food = db.query(FoodRecord).filter_by(food_id=food_id).first()
            if food:
                surplus_qty = food.surplus_quantity
                food_name = food.food_name
                food_type = food.food_type
                if food.restaurant:
                    lat = food.restaurant.latitude
                    lng = food.restaurant.longitude

        if not lat or not lng:
            # Default to Hyderabad central coords
            lat = 17.3850
            lng = 78.4867

        ngos = db.query(NGO).all()
        recommendations = RecommendationService.calculate_match(
            surplus_quantity=surplus_qty,
            food_name=food_name,
            food_type=food_type,
            rest_lat=lat,
            rest_lng=lng,
            ngos=ngos
        )

        return jsonify({
            'query_params': {
                'surplus_quantity': surplus_qty,
                'food_name': food_name,
                'food_type': food_type,
                'origin_coordinates': {'lat': lat, 'lng': lng}
            },
            'total_evaluated': len(ngos),
            'recommended_ngos': recommendations
        }), 200

    finally:
        db.close()

@ngo_bp.route('/<int:ngo_id>', methods=['GET'])
def get_ngo(ngo_id):
    db = SessionLocal()
    try:
        ngo = db.query(NGO).filter_by(ngo_id=ngo_id).first()
        if not ngo:
            return jsonify({'error': 'NGO not found.'}), 404
        return jsonify(ngo.to_dict()), 200
    finally:
        db.close()

@ngo_bp.route('/<int:ngo_id>', methods=['PUT'])
@jwt_required(allowed_roles=['ngo', 'admin'])
def update_ngo(ngo_id):
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        ngo = db.query(NGO).filter_by(ngo_id=ngo_id).first()
        if not ngo:
            return jsonify({'error': 'NGO not found.'}), 404

        if 'capacity' in data:
            ngo.capacity = float(data['capacity'])
        if 'required_quantity' in data:
            ngo.required_quantity = float(data['required_quantity'])
        if 'availability' in data:
            ngo.availability = data['availability']
        if 'food_requirement' in data:
            ngo.food_requirement = data['food_requirement']
        if 'contact_phone' in data:
            ngo.contact_phone = data['contact_phone']

        db.commit()
        return jsonify({'message': 'NGO profile updated successfully.', 'ngo': ngo.to_dict()}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
