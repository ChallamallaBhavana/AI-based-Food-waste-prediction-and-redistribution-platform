import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database.db import init_db
from database.seed_data import seed_all
from routes import (
    auth_bp,
    food_bp,
    predict_bp,
    safety_bp,
    ngo_bp,
    donation_bp,
    delivery_bp,
    analytics_bp,
    admin_bp
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger('FoodWasteApp')

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for React dev server and production origins
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize database tables and seed sample data
    with app.app_context():
        try:
            init_db()
            seed_all()
        except Exception as e:
            logger.error(f"Error during database initialization/seeding: {e}")

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(food_bp, url_prefix='/api/food')
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    app.register_blueprint(safety_bp, url_prefix='/api/safety')
    app.register_blueprint(ngo_bp, url_prefix='/api/ngos')
    app.register_blueprint(donation_bp, url_prefix='/api/donations')
    app.register_blueprint(delivery_bp, url_prefix='/api/deliveries')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Root & Health endpoints
    @app.route('/')
    def root():
        return jsonify({
            'project': 'AI-BASED FOOD WASTE PREDICTION AND REDISTRIBUTION SYSTEM',
            'version': '1.0.0',
            'status': 'Online',
            'docs': '/api/health'
        }), 200

    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Food Waste Prediction & Redistribution API',
            'modules': {
                'ai_prediction': 'Active (Scikit-learn RandomForest)',
                'food_safety': 'Active (FSSAI Rule Engine)',
                'ngo_recommendation': 'Active (Multi-factor Algorithmic)',
                'smart_transportation': 'Active (Live Coordinate Routing)',
                'analytics': 'Active (Dynamic Aggregate Aggregator)'
            }
        }), 200

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Requested API endpoint not found.'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error(f"Server Error: {e}")
        return jsonify({'error': 'An internal server error occurred.'}), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting server on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
