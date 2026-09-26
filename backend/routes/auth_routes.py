from flask import Blueprint, request, jsonify, g
from database.db import SessionLocal
from models.user import User
from models.restaurant import Restaurant
from models.ngo import NGO
from utils.auth_middleware import generate_token, jwt_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'restaurant').strip().lower()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required fields.'}), 400

    if role not in ['restaurant', 'ngo', 'admin']:
        return jsonify({'error': 'Invalid role. Must be restaurant, ngo, or admin.'}), 400

    db = SessionLocal()
    try:
        existing = db.query(User).filter_by(email=email).first()
        if existing:
            return jsonify({'error': 'An account with this email address already exists.'}), 409

        new_user = User(name=name, email=email, phone=phone, role=role)
        new_user.set_password(password)
        db.add(new_user)
        db.flush()

        # If restaurant, create restaurant profile
        if role == 'restaurant':
            rest_name = data.get('restaurant_name') or f"{name}'s Kitchen"
            location = data.get('location') or 'Banjara Hills, Hyderabad'
            lat = float(data.get('latitude', 17.4156))
            lng = float(data.get('longitude', 78.4350))
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
            ngo_name = data.get('ngo_name') or f"{name} Foundation"
            location = data.get('location') or 'Secunderabad, Hyderabad'
            food_req = data.get('food_requirement') or 'All Cooked Meals'
            cap = float(data.get('capacity', 150))
            req_qty = float(data.get('required_quantity', 60))
            lat = float(data.get('latitude', 17.4411))
            lng = float(data.get('longitude', 78.4983))
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
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500
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
