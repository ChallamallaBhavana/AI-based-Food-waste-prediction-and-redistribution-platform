import datetime
from flask import Blueprint, request, jsonify, g
from database.db import SessionLocal
from models.donation import Donation
from models.delivery import Delivery
from models.food_record import FoodRecord
from models.ngo import NGO
from models.restaurant import Restaurant
from services.transport_service import TransportService
from utils.auth_middleware import jwt_required

donation_bp = Blueprint('donations', __name__)

@donation_bp.route('/create', methods=['POST'])
@jwt_required(allowed_roles=['restaurant', 'admin'])
def create_donation():
    data = request.get_json() or {}
    
    food_id = data.get('food_id')
    ngo_id = data.get('ngo_id')
    
    if not food_id or not ngo_id:
        return jsonify({'error': 'food_id and ngo_id are required fields.'}), 400

    db = SessionLocal()
    try:
        food = db.query(FoodRecord).filter_by(food_id=food_id).first()
        if not food:
            return jsonify({'error': 'Food record not found.'}), 404

        ngo = db.query(NGO).filter_by(ngo_id=ngo_id).first()
        if not ngo:
            return jsonify({'error': 'Selected NGO not found.'}), 404

        quantity = float(data.get('donation_quantity') or food.surplus_quantity or 10.0)
        notes = data.get('notes', 'Direct redistribution via platform dispatch')

        # 1. Create Donation
        donation = Donation(
            food_id=food.food_id,
            ngo_id=ngo.ngo_id,
            donation_quantity=quantity,
            status='Pending',
            notes=notes
        )
        db.add(donation)
        db.flush()

        # 2. Automatically generate Delivery record
        restaurant = food.restaurant
        pickup_loc = restaurant.location if restaurant else 'Restaurant Hub'
        dest_loc = ngo.location
        pickup_lat = restaurant.latitude if restaurant else 17.3850
        pickup_lng = restaurant.longitude if restaurant else 78.4867
        dest_lat = ngo.latitude or 17.4000
        dest_lng = ngo.longitude or 78.4900

        route_info = TransportService.calculate_delivery_route(
            pickup_lat=pickup_lat,
            pickup_lng=pickup_lng,
            dest_lat=dest_lat,
            dest_lng=dest_lng,
            pickup_name=restaurant.restaurant_name if restaurant else 'Restaurant Hub',
            dest_name=ngo.ngo_name
        )

        delivery = Delivery(
            donation_id=donation.donation_id,
            pickup_location=pickup_loc,
            destination=dest_loc,
            pickup_lat=pickup_lat,
            pickup_lng=pickup_lng,
            dest_lat=dest_lat,
            dest_lng=dest_lng,
            route=route_info['route'],
            distance=route_info['distance'],
            estimated_time=route_info['estimated_time'],
            delivery_status='Pending'
        )
        db.add(delivery)
        db.commit()

        res_dict = donation.to_dict()
        res_dict['delivery'] = delivery.to_dict()

        return jsonify({
            'message': 'Donation and dispatch delivery initialized successfully.',
            'donation': res_dict
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({'error': f'Failed to create donation: {str(e)}'}), 500
    finally:
        db.close()

@donation_bp.route('', methods=['GET'])
@jwt_required()
def list_donations():
    db = SessionLocal()
    try:
        query = db.query(Donation)
        role = g.current_user.role

        if role == 'restaurant':
            rest = db.query(Restaurant).filter_by(user_id=g.current_user.user_id).first()
            if rest:
                query = query.join(FoodRecord).filter(FoodRecord.restaurant_id == rest.restaurant_id)
        elif role == 'ngo':
            ngo = db.query(NGO).filter_by(user_id=g.current_user.user_id).first()
            if ngo:
                query = query.filter(Donation.ngo_id == ngo.ngo_id)

        donations = query.order_by(Donation.donation_date.desc()).all()
        return jsonify([d.to_dict() for d in donations]), 200
    finally:
        db.close()

@donation_bp.route('/<int:donation_id>', methods=['GET'])
@jwt_required()
def get_donation(donation_id):
    db = SessionLocal()
    try:
        donation = db.query(Donation).filter_by(donation_id=donation_id).first()
        if not donation:
            return jsonify({'error': 'Donation not found.'}), 404

        d = donation.to_dict()
        if donation.delivery:
            d['delivery'] = donation.delivery.to_dict()
        return jsonify(d), 200
    finally:
        db.close()

@donation_bp.route('/<int:donation_id>/status', methods=['PUT'])
@jwt_required()
def update_donation_status(donation_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({'error': 'Status is required.'}), 400

    db = SessionLocal()
    try:
        donation = db.query(Donation).filter_by(donation_id=donation_id).first()
        if not donation:
            return jsonify({'error': 'Donation not found.'}), 404

        donation.status = new_status
        if donation.delivery and new_status in ['Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered']:
            donation.delivery.delivery_status = new_status

        db.commit()
        return jsonify({'message': f'Status updated to {new_status}.', 'donation': donation.to_dict()}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
