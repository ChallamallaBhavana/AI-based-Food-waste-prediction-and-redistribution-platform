import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base

class Donation(Base):
    __tablename__ = 'donations'

    donation_id = Column(Integer, primary_key=True, autoincrement=True)
    food_id = Column(Integer, ForeignKey('food_records.food_id', ondelete='CASCADE'), nullable=False)
    ngo_id = Column(Integer, ForeignKey('ngos.ngo_id', ondelete='CASCADE'), nullable=False)
    donation_quantity = Column(Float, nullable=False, default=0.0)
    donation_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), nullable=False, default='Pending') # Pending, Accepted, Picked Up, In Transit, Delivered, Cancelled
    notes = Column(String(255), nullable=True)

    # Relationships
    food_record = relationship('FoodRecord', back_populates='donations')
    ngo = relationship('NGO', back_populates='donations')
    delivery = relationship('Delivery', back_populates='donation', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'donation_id': self.donation_id,
            'food_id': self.food_id,
            'food_name': self.food_record.food_name if self.food_record else None,
            'restaurant_name': self.food_record.restaurant.restaurant_name if self.food_record and self.food_record.restaurant else None,
            'ngo_id': self.ngo_id,
            'ngo_name': self.ngo.ngo_name if self.ngo else None,
            'donation_quantity': self.donation_quantity,
            'donation_date': self.donation_date.isoformat() if self.donation_date else None,
            'status': self.status,
            'notes': self.notes,
            'delivery_id': self.delivery.delivery_id if self.delivery else None
        }
