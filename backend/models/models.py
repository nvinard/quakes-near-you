from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

from ..database.database import Base

class Earthquakes(Base):
    __tablename__ = "earthquakes"
    #__table_args__ = {'extend_existing': True}  # Add this line to extend existing table
    
    id = Column(String, primary_key=True)
    magnitude = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    depth = Column(Float)
    place = Column(String)
    origin_time = Column(Integer)
    utc_time = Column(String)
    magnitude_type = Column(String)
    title = Column(String)
    