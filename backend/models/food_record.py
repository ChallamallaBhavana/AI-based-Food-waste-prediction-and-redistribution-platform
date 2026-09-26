import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base

class FoodRecord(Base):
    __tablename__ = 'food_records'

    food_id = Column(Integer, primary_key=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey('restaurants.restaurant_id', ondelete='CASCADE'), nullable=False)
    food_name = Column(String(150), nullable=False)
    food_type = Column(String(50), nullable=True, default='Cooked Meal') # Cooked Meal, Bakery, Dairy, Raw Vegetables, Meat/Gravy
    quantity_prepared = Column(Float, nullable=False, default=0.0)
    quantity_sold = Column(Float, nullable=False, default=0.0)
    surplus_quantity = Column(Float, nullable=False, default=0.0)
    preparation_time = Column(DateTime, nullable=True)
    expiry_time = Column(DateTime, nullable=True)
    weather = Column(String(50), nullable=True, default='Sunny')
    festival = Column(String(100), nullable=True, default='None')
    temperature = Column(Float, nullable=True, default=25.0)
    storage_condition = Column(String(50), nullable=True, default='Room Temperature')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    restaurant = relationship('Restaurant', back_populates='food_records')
    predictions = relationship('Prediction', back_populates='food_record', cascade='all, delete-orphan')
    food_safeties = relationship('FoodSafety', back_populates='food_record', cascade='all, delete-orphan')
    donations = relationship('Donation', back_populates='food_record', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'food_id': self.food_id,
            'restaurant_id': self.restaurant_id,
            'restaurant_name': self.restaurant.restaurant_name if self.restaurant else None,
            'food_name': self.food_name,
            'food_type': self.food_type,
            'quantity_prepared': self.quantity_prepared,
            'quantity_sold': self.quantity_sold,
            'surplus_quantity': self.surplus_quantity,
            'preparation_time': self.preparation_time.isoformat() if self.preparation_time else None,
            'expiry_time': self.expiry_time.isoformat() if self.expiry_time else None,
            'weather': self.weather,
            'festival': self.festival,
            'temperature': self.temperature,
            'storage_condition': self.storage_condition,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
