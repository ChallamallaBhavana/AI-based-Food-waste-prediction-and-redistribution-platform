import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base

class Prediction(Base):
    __tablename__ = 'predictions'

    prediction_id = Column(Integer, primary_key=True, autoincrement=True)
    food_id = Column(Integer, ForeignKey('food_records.food_id', ondelete='CASCADE'), nullable=False)
    predicted_surplus = Column(Float, nullable=False, default=0.0)
    prediction_date = Column(DateTime, default=datetime.datetime.utcnow)
    demand_level = Column(String(50), nullable=False, default='Medium') # High, Medium, Low
    waste_risk = Column(String(50), nullable=False, default='Low')      # High, Moderate, Low
    confidence = Column(Float, nullable=False, default=0.85)

    # Relationships
    food_record = relationship('FoodRecord', back_populates='predictions')

    def to_dict(self):
        return {
            'prediction_id': self.prediction_id,
            'food_id': self.food_id,
            'predicted_surplus': self.predicted_surplus,
            'prediction_date': self.prediction_date.isoformat() if self.prediction_date else None,
            'demand_level': self.demand_level,
            'waste_risk': self.waste_risk,
            'confidence': self.confidence
        }
