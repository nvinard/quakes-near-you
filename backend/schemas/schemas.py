from pydantic import BaseModel

class EarthquakeBase(BaseModel):
    id: str
    magnitude: float
    latitude: float
    longitude: float
    depth: float
    place: str
    origin_time: int
    utc_time: str
    magnitude_type: str
    title: str
    
class EarthquakeModel(EarthquakeBase):
    id: str
    
    class Config:
        orm_mode = True
