import datetime
from sqlalchemy import Column, Integer, Float, Date
from database.db import Base

class Analytics(Base):
    __tablename__ = 'analytics'

    analytics_id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, unique=True, default=datetime.date.today)
    total_surplus = Column(Float, nullable=False, default=0.0)
    total_redistributed = Column(Float, nullable=False, default=0.0)
    total_waste = Column(Float, nullable=False, default=0.0)
    donation_count = Column(Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            'analytics_id': self.analytics_id,
            'date': self.date.isoformat() if self.date else None,
            'total_surplus': round(self.total_surplus, 1),
            'total_redistributed': round(self.total_redistributed, 1),
            'total_waste': round(self.total_waste, 1),
            'donation_count': self.donation_count
        }
