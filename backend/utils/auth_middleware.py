import jwt
import datetime
from functools import wraps
from flask import request, jsonify, g
from config import Config
from database.db import SessionLocal
from models.user import User

def generate_token(user_id, role, email):
    """Generate JWT auth token."""
    payload = {
        'user_id': user_id,
        'role': role,
        'email': email,
        'exp': datetime.datetime.utcnow() + Config.JWT_EXPIRY_DELTA,
        'iat': datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    return token

def jwt_required(allowed_roles=None):
    """
    Decorator to protect routes with JWT and enforce optional role permissions.
    allowed_roles: list or str of permitted roles e.g. ['restaurant', 'admin']
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({'error': 'Authorization header is missing'}), 401

            parts = auth_header.split()
            if parts[0].lower() != 'bearer' or len(parts) != 2:
                return jsonify({'error': 'Invalid Authorization header format. Expected Bearer <token>'}), 401

            token = parts[1]
            try:
                payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            except jwt.ExpiredSignatureError:
                return jsonify({'error': 'Authentication token has expired. Please log in again.'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'error': 'Invalid authentication token.'}), 401

            # Fetch user
            db = SessionLocal()
            try:
                user = db.query(User).filter_by(user_id=payload['user_id']).first()
                if not user:
                    return jsonify({'error': 'User associated with token no longer exists.'}), 401
                
                # Check role if required
                if allowed_roles and user.role not in allowed_roles:
                    return jsonify({
                        'error': f'Access forbidden. Requires one of roles: {allowed_roles}. Current role: {user.role}'
                    }), 403

                # Attach user to flask global context
                g.current_user = user
                g.token_payload = payload
            finally:
                db.close()

            return f(*args, **kwargs)
        return decorated_function
    return decorator
