from flask import Blueprint, jsonify, request
from database.db import SessionLocal
from models.user import User
from models.restaurant import Restaurant
from models.ngo import NGO
from models.food_record import FoodRecord
from models.donation import Donation
from models.delivery import Delivery
from utils.auth_middleware import jwt_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/overview', methods=['GET'])
@jwt_required(allowed_roles=['admin'])
def get_admin_overview():
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        rest_count = db.query(Restaurant).count()
        ngo_count = db.query(NGO).count()
        food_count = db.query(FoodRecord).count()
        donation_count = db.query(Donation).count()
        delivery_count = db.query(Delivery).count()

        return jsonify({
            'total_users': user_count,
            'total_restaurants': rest_count,
            'total_ngos': ngo_count,
            'total_food_records': food_count,
            'total_donations': donation_count,
            'total_deliveries': delivery_count
        }), 200
    finally:
        db.close()

@admin_bp.route('/users', methods=['GET'])
@jwt_required(allowed_roles=['admin'])
def get_all_users():
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.created_at.desc()).all()
        results = []
        for u in users:
            d = u.to_dict()
            if u.role == 'restaurant' and u.restaurants:
                d['entity_name'] = u.restaurants[0].restaurant_name
                d['entity_location'] = u.restaurants[0].location
            elif u.role == 'ngo' and u.ngos:
                d['entity_name'] = u.ngos[0].ngo_name
                d['entity_location'] = u.ngos[0].location
            else:
                d['entity_name'] = 'System Administrator'
                d['entity_location'] = 'Central HQ'
            results.append(d)
        return jsonify(results), 200
    finally:
        db.close()

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required(allowed_roles=['admin'])
def delete_user(user_id):
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(user_id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found.'}), 404

        db.delete(user)
        db.commit()
        return jsonify({'message': f'User #{user_id} deleted successfully.'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@admin_bp.route('/restaurants', methods=['GET'])
@jwt_required(allowed_roles=['admin'])
def get_restaurants():
    db = SessionLocal()
    try:
        rests = db.query(Restaurant).all()
        results = []
        for r in rests:
            d = r.to_dict()
            d['records_count'] = len(r.food_records)
            d['user_email'] = r.user.email if r.user else None
            results.append(d)
        return jsonify(results), 200
    finally:
        db.close()

@admin_bp.route('/reports', methods=['GET'])
@jwt_required(allowed_roles=['admin'])
def get_system_reports():
    db = SessionLocal()
    try:
        # Recent high-priority deliveries
        deliveries = db.query(Delivery).order_by(Delivery.created_at.desc()).limit(10).all()
        # High risk food records
        food_recs = db.query(FoodRecord).order_by(FoodRecord.created_at.desc()).limit(10).all()

        return jsonify({
            'system_health': 'Operational',
            'ml_pipeline_status': 'Active (RandomForest Scikit-learn v1.7)',
            'fssai_engine_status': 'Active (2026 Standards)',
            'recent_deliveries': [d.to_dict() for d in deliveries],
            'recent_food_records': [f.to_dict() for f in food_recs]
        }), 200
    finally:
        db.close()
