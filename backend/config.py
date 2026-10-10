import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_food_waste_secret_key_2026')
    JWT_EXPIRY_DELTA = timedelta(hours=int(os.getenv('JWT_EXPIRY_HOURS', 72)))
    
    # Database URL
    db_url = os.getenv('DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'food_waste.db')}")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    elif db_url.startswith("sqlite:///"):
        # Ensure relative SQLite path is resolved relative to BASE_DIR
        db_path = db_url.replace("sqlite:///", "")
        if not os.path.isabs(db_path):
            db_url = f"sqlite:///{os.path.join(BASE_DIR, db_path)}"
            
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    } if not db_url.startswith("sqlite") else {}
    
    DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')
    PORT = int(os.getenv('PORT', 5000))
    
    # External APIs
    OPENWEATHERMAP_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY', '')
    GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')
