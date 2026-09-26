from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base

class NGO(Base):
    __tablename__ = 'ngos'

    ngo_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    ngo_name = Column(String(150), nullable=False)
    location = Column(String(255), nullable=False)
    contact_phone = Column(String(30), nullable=False)
    food_requirement = Column(String(100), nullable=False, default='All Cooked Meals') # e.g. 'All Cooked Meals', 'Vegetarian Only', 'Dry Rations & Bakery'
    required_quantity = Column(Float, nullable=False, default=50.0)
    capacity = Column(Float, nullable=False, default=100.0)
    availability = Column(String(30), nullable=False, default='Available') # Available, Busy, Inactive
    latitude = Column(Float, nullable=True, default=17.3850)
    longitude = Column(Float, nullable=True, default=78.4867)

    # Relationships
    user = relationship('User', back_populates='ngos')
    donations = relationship('Donation', back_populates='ngo', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'ngo_id': self.ngo_id,
            'user_id': self.user_id,
            'ngo_name': self.ngo_name,
            'location': self.location,
            'contact_phone': self.contact_phone,
            'food_requirement': self.food_requirement,
            'required_quantity': self.required_quantity,
            'capacity': self.capacity,
            'availability': self.availability,
            'latitude': self.latitude,
            'longitude': self.longitude
        }
