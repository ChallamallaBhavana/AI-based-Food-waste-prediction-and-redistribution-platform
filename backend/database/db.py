import logging
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from config import Config, BASE_DIR

logger = logging.getLogger(__name__)

Base = declarative_base()

# Attempt database engine creation with fallback to SQLite if MySQL fails to connect
try:
    engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, **Config.SQLALCHEMY_ENGINE_OPTIONS)
    # Test connection
    with engine.connect() as conn:
        pass
    logger.info(f"Connected to primary database: {Config.SQLALCHEMY_DATABASE_URI}")
except Exception as e:
    logger.warning(f"Could not connect to {Config.SQLALCHEMY_DATABASE_URI} ({e}). Falling back to SQLite.")
    sqlite_path = os.path.join(BASE_DIR, "food_waste.db")
    engine = create_engine(f"sqlite:///{sqlite_path}")

SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    import models  # Ensure all models are imported before creating tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
