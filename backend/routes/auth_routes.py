from flask import Blueprint, request, jsonify, g
from database.db import SessionLocal
from models.user import User
from models.restaurant import Restaurant
from models.ngo import NGO
from utils.auth_middleware import generate_token, jwt_required

auth_bp = Blueprint('auth', __name__)

import re
import logging
from sqlalchemy import func

logger = logging.getLogger(__name__)
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

def _safe_float(val, default):
    if val is None:
        return default
    try:
        s = str(val).strip()
        return float(s) if s != '' else default
    except (ValueError, TypeError):
        return default

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get('name', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    phone = str(data.get('phone', '')).strip()
    password = str(data.get('password', ''))
    role = str(data.get('role', 'restaurant')).strip().lower()

    if not name:
        return jsonify({'error': 'Full name is required.'}), 400

    if not email:
        return jsonify({'error': 'Email address is required.'}), 400

    if not EMAIL_REGEX.match(email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400

    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    if phone and len(re.sub(r'\D', '', phone)) < 7:
        return jsonify({'error': 'Please enter a valid phone number.'}), 400

    if role not in ['restaurant', 'ngo', 'admin']:
        return jsonify({'error': 'Invalid account type. Must be restaurant, ngo, or admin.'}), 400

    db = SessionLocal()
    try:
        existing_email = db.query(User).filter(func.lower(User.email) == email).first()
        if existing_email:
            return jsonify({'error': 'Email is already registered. Please sign in.'}), 409

        if phone:
            existing_phone = db.query(User).filter(User.phone == phone).first()
            if existing_phone:
                return jsonify({'error': 'Phone number is already registered with another account.'}), 409

        new_user = User(name=name, email=email, phone=phone, role=role)
        new_user.set_password(password)
        db.add(new_user)
        db.flush()

        # If restaurant, create restaurant profile
        if role == 'restaurant':
            rest_id = data.get('restaurant_id')
            rest_name = str(data.get('restaurant_name') or '').strip()
            location = str(data.get('location') or '').strip()
            lat = 17.4156
            lng = 78.4350

            if rest_id:
                try:
                    existing_rest = db.query(Restaurant).filter_by(restaurant_id=int(rest_id)).first()
                    if existing_rest:
                        if not rest_name:
                            rest_name = existing_rest.restaurant_name
                        if not location:
                            location = existing_rest.location
                        if existing_rest.latitude is not None:
                            lat = existing_rest.latitude
                        if existing_rest.longitude is not None:
                            lng = existing_rest.longitude
                except Exception as ex:
                    logger.warning(f"Error looking up restaurant_id {rest_id}: {ex}")

            rest_name = rest_name or f"{name}'s Kitchen"
            location = location or 'Banjara Hills, Hyderabad'
            lat = _safe_float(data.get('latitude'), lat)
            lng = _safe_float(data.get('longitude'), lng)
            restaurant = Restaurant(
                user_id=new_user.user_id,
                restaurant_name=rest_name,
                location=location,
                contact=phone,
                latitude=lat,
                longitude=lng
            )
            db.add(restaurant)

        # If NGO, create NGO profile
        elif role == 'ngo':
            ngo_name = str(data.get('ngo_name') or '').strip() or f"{name} Foundation"
            location = str(data.get('location') or '').strip() or 'Secunderabad, Hyderabad'
            food_req = str(data.get('food_requirement') or '').strip() or 'All Cooked Meals'
            cap = _safe_float(data.get('capacity'), 150.0)
            req_qty = _safe_float(data.get('required_quantity'), 60.0)
            lat = _safe_float(data.get('latitude'), 17.4411)
            lng = _safe_float(data.get('longitude'), 78.4983)
            ngo = NGO(
                user_id=new_user.user_id,
                ngo_name=ngo_name,
                location=location,
                contact_phone=phone,
                food_requirement=food_req,
                capacity=cap,
                required_quantity=req_qty,
                availability='Available',
                latitude=lat,
                longitude=lng
            )
            db.add(ngo)

        db.commit()

        token = generate_token(new_user.user_id, new_user.role, new_user.email)
        return jsonify({
            'message': 'Account registered successfully.',
            'token': token,
            'user': new_user.to_dict()
        }), 201

    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {e}", exc_info=True)
        return jsonify({'error': 'Registration could not be completed. Please check your information and try again.'}), 400
    finally:
        db.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    requested_role = data.get('role')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password.'}), 401

        # Check role match if explicitly supplied in login form
        if requested_role and user.role != requested_role.lower():
            return jsonify({'error': f'Account role is {user.role}, but selected {requested_role}.'}), 403

        token = generate_token(user.user_id, user.role, user.email)
        user_info = user.to_dict()

        # Append entity details
        if user.role == 'restaurant':
            rest = db.query(Restaurant).filter_by(user_id=user.user_id).first()
            if rest:
                user_info['restaurant'] = rest.to_dict()
        elif user.role == 'ngo':
            ngo = db.query(NGO).filter_by(user_id=user.user_id).first()
            if ngo:
                user_info['ngo'] = ngo.to_dict()

        return jsonify({
            'message': 'Login successful.',
            'token': token,
            'user': user_info
        }), 200

    finally:
        db.close()

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_profile():
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(user_id=g.current_user.user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = user.to_dict()
        if user.role == 'restaurant':
            rest = db.query(Restaurant).filter_by(user_id=user.user_id).first()
            if rest:
                data['restaurant'] = rest.to_dict()
        elif user.role == 'ngo':
            ngo = db.query(NGO).filter_by(user_id=user.user_id).first()
            if ngo:
                data['ngo'] = ngo.to_dict()

        return jsonify({'user': data}), 200
    finally:
        db.close()

@auth_bp.route('/demo-accounts', methods=['GET'])
def get_demo_accounts():
    return jsonify({
        'accounts': [
            {
                'role': 'restaurant',
                'name': 'Royal Spice Grand',
                'email': 'restaurant@example.com',
                'password': 'password123',
                'description': 'Restaurant Manager Portal'
            },
            {
                'role': 'ngo',
                'name': 'Annapurna Seva Trust',
                'email': 'ngo@example.com',
                'password': 'password123',
                'description': 'NGO Food Recipient Portal'
            },
            {
                'role': 'admin',
                'name': 'System Administrator',
                'email': 'admin@example.com',
                'password': 'password123',
                'description': 'Central System Governance'
            }
        ]
    })

@auth_bp.route('/restaurants', methods=['GET'])
def get_available_restaurants():
    db = SessionLocal()
    try:
        rests = db.query(Restaurant).all()
        result = []
        seen = set()
        for r in rests:
            clean_name = (r.restaurant_name or '').strip()
            if clean_name and clean_name.lower() not in seen:
                seen.add(clean_name.lower())
                result.append({
                    'restaurant_id': r.restaurant_id,
                    'restaurant_name': clean_name,
                    'location': r.location or 'Hyderabad'
                })
        return jsonify({'restaurants': result}), 200
    except Exception as e:
        logger.error(f"Error fetching restaurants: {e}")
        return jsonify({'restaurants': []}), 200
    finally:
        db.close()

