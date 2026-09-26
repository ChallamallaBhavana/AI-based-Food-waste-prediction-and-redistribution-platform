from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base

class Restaurant(Base):
    __tablename__ = 'restaurants'

    restaurant_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    restaurant_name = Column(String(150), nullable=False)
    location = Column(String(255), nullable=False)
    contact = Column(String(30), nullable=True)
    latitude = Column(Float, nullable=True, default=17.3850)
    longitude = Column(Float, nullable=True, default=78.4867)

    # Relationships
    user = relationship('User', back_populates='restaurants')
    food_records = relationship('FoodRecord', back_populates='restaurant', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'restaurant_id': self.restaurant_id,
            'user_id': self.user_id,
            'restaurant_name': self.restaurant_name,
            'location': self.location,
            'contact': self.contact,
            'latitude': self.latitude,
            'longitude': self.longitude
        }
