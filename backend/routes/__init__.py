from routes.auth_routes import auth_bp
from routes.food_routes import food_bp
from routes.prediction_routes import predict_bp
from routes.safety_routes import safety_bp
from routes.ngo_routes import ngo_bp
from routes.donation_routes import donation_bp
from routes.delivery_routes import delivery_bp
from routes.analytics_routes import analytics_bp
from routes.admin_routes import admin_bp

__all__ = [
    'auth_bp',
    'food_bp',
    'predict_bp',
    'safety_bp',
    'ngo_bp',
    'donation_bp',
    'delivery_bp',
    'analytics_bp',
    'admin_bp'
]
