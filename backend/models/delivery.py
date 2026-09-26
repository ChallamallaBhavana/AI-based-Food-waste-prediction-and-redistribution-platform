import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.db import Base

class Delivery(Base):
    __tablename__ = 'deliveries'

    delivery_id = Column(Integer, primary_key=True, autoincrement=True)
    donation_id = Column(Integer, ForeignKey('donations.donation_id', ondelete='CASCADE'), nullable=False, unique=True)
    pickup_location = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    pickup_lat = Column(Float, nullable=True, default=17.3850)
    pickup_lng = Column(Float, nullable=True, default=78.4867)
    dest_lat = Column(Float, nullable=True, default=17.4000)
    dest_lng = Column(Float, nullable=True, default=78.4900)
    route = Column(Text, nullable=True) # JSON or summary of route
    distance = Column(Float, nullable=False, default=5.0) # km
    estimated_time = Column(String(50), nullable=False, default='25 mins')
    delivery_status = Column(String(50), nullable=False, default='Pending') # Pending -> Accepted -> Picked Up -> In Transit -> Delivered
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    donation = relationship('Donation', back_populates='delivery')

    def to_dict(self):
        return {
            'delivery_id': self.delivery_id,
            'donation_id': self.donation_id,
            'pickup_location': self.pickup_location,
            'destination': self.destination,
            'pickup_lat': self.pickup_lat,
            'pickup_lng': self.pickup_lng,
            'dest_lat': self.dest_lat,
            'dest_lng': self.dest_lng,
            'route': self.route,
            'distance': self.distance,
            'estimated_time': self.estimated_time,
            'delivery_status': self.delivery_status,
            'food_name': self.donation.food_record.food_name if self.donation and self.donation.food_record else None,
            'quantity': self.donation.donation_quantity if self.donation else 0,
            'restaurant_name': self.donation.food_record.restaurant.restaurant_name if (self.donation and self.donation.food_record and self.donation.food_record.restaurant) else None,
            'ngo_name': self.donation.ngo.ngo_name if self.donation and self.donation.ngo else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
