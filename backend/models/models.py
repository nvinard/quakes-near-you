from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Earthquakes(Base):
    __tablename__ = "earthquake"
    __table_args__ = {'extend_existing': True}  # Add this line to extend existing table
    
    id = Column(Integer, primary_key=True, index=True)
    magnitude = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    depth = Column(Float)
    place = Column(String)
    origin_time = Column(Integer)
    magnitude_type = Column(String)
    title = Column(String)
