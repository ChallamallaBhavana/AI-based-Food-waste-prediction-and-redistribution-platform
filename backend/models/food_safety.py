import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.db import Base

class FoodSafety(Base):
    __tablename__ = 'food_safety'

    safety_id = Column(Integer, primary_key=True, autoincrement=True)
    food_id = Column(Integer, ForeignKey('food_records.food_id', ondelete='CASCADE'), nullable=False)
    preparation_time = Column(DateTime, nullable=True)
    storage_condition = Column(String(100), nullable=True, default='Room Temperature')
    expiry_time = Column(DateTime, nullable=True)
    safety_status = Column(String(50), nullable=False) # SAFE FOR REDISTRIBUTION, NOT SAFE FOR REDISTRIBUTION, NEEDS REVIEW
    validation_reason = Column(Text, nullable=True)
    validation_date = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    food_record = relationship('FoodRecord', back_populates='food_safeties')

    def to_dict(self):
        return {
            'safety_id': self.safety_id,
            'food_id': self.food_id,
            'preparation_time': self.preparation_time.isoformat() if self.preparation_time else None,
            'storage_condition': self.storage_condition,
            'expiry_time': self.expiry_time.isoformat() if self.expiry_time else None,
            'safety_status': self.safety_status,
            'validation_reason': self.validation_reason,
            'validation_date': self.validation_date.isoformat() if self.validation_date else None
        }
