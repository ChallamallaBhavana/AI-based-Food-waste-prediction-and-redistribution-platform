from flask import Blueprint, request, jsonify, g
from database.db import SessionLocal
from models.delivery import Delivery
from models.donation import Donation
from models.restaurant import Restaurant
from models.ngo import NGO
from models.food_record import FoodRecord
from services.transport_service import TransportService
from utils.auth_middleware import jwt_required

delivery_bp = Blueprint('deliveries', __name__)

@delivery_bp.route('', methods=['GET'])
@jwt_required()
def list_deliveries():
    db = SessionLocal()
    try:
        query = db.query(Delivery).join(Donation)
        role = g.current_user.role

        if role == 'restaurant':
            rest = db.query(Restaurant).filter_by(user_id=g.current_user.user_id).first()
            if rest:
                query = query.join(FoodRecord, Donation.food_id == FoodRecord.food_id).filter(FoodRecord.restaurant_id == rest.restaurant_id)
        elif role == 'ngo':
            ngo = db.query(NGO).filter_by(user_id=g.current_user.user_id).first()
            if ngo:
                query = query.filter(Donation.ngo_id == ngo.ngo_id)

        deliveries = query.order_by(Delivery.created_at.desc()).all()
        return jsonify([deliv.to_dict() for deliv in deliveries]), 200
    finally:
        db.close()

@delivery_bp.route('/<int:delivery_id>', methods=['GET'])
@jwt_required()
def get_delivery_details(delivery_id):
    db = SessionLocal()
    try:
        deliv = db.query(Delivery).filter_by(delivery_id=delivery_id).first()
        if not deliv:
            return jsonify({'error': 'Delivery record not found.'}), 404

        d = deliv.to_dict()

        # Compute or fetch route coordinates
        route_meta = TransportService.calculate_delivery_route(
            pickup_lat=deliv.pickup_lat,
            pickup_lng=deliv.pickup_lng,
            dest_lat=deliv.dest_lat,
            dest_lng=deliv.dest_lng,
            pickup_name=deliv.pickup_location,
            dest_name=deliv.destination
        )
        d['waypoints'] = route_meta['waypoints']
        d['pickup_coords'] = route_meta['pickup']
        d['dest_coords'] = route_meta['destination']
        d['timeline_steps'] = ['Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered']
        d['current_step_index'] = d['timeline_steps'].index(deliv.delivery_status) if deliv.delivery_status in d['timeline_steps'] else 0

        return jsonify(d), 200
    finally:
        db.close()

@delivery_bp.route('/<int:delivery_id>/advance', methods=['PUT'])
@jwt_required()
def advance_delivery_status(delivery_id):
    """Advances delivery through: Pending -> Accepted -> Picked Up -> In Transit -> Delivered"""
    db = SessionLocal()
    try:
        deliv = db.query(Delivery).filter_by(delivery_id=delivery_id).first()
        if not deliv:
            return jsonify({'error': 'Delivery record not found.'}), 404

        next_status = TransportService.get_next_valid_status(deliv.delivery_status)
        deliv.delivery_status = next_status

        # Synchronize donation status
        if deliv.donation:
            deliv.donation.status = next_status

        db.commit()
        return jsonify({
            'message': f'Delivery status advanced to: {next_status}',
            'delivery_status': next_status,
            'delivery': deliv.to_dict()
        }), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@delivery_bp.route('/<int:delivery_id>/status', methods=['PUT'])
@jwt_required()
def update_delivery_status(delivery_id):
    data = request.get_json() or {}
    status = data.get('status')
    if not status:
        return jsonify({'error': 'Status is required.'}), 400

    db = SessionLocal()
    try:
        deliv = db.query(Delivery).filter_by(delivery_id=delivery_id).first()
        if not deliv:
            return jsonify({'error': 'Delivery not found.'}), 404

        deliv.delivery_status = status
        if deliv.donation:
            deliv.donation.status = status

        db.commit()
        return jsonify({'message': f'Status updated to {status}.', 'delivery': deliv.to_dict()}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()
