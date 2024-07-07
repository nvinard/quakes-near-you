from pydantic import BaseModel

class EarthquakeBase(BaseModel):
    magnitude: float
    latitude: float
    longitude: float
    depth: float
    place: str
    origin_time: int
    magnitude_type: str
    title: str
    
class EarthquakeModel(EarthquakeBase):
    id: int
    
    class Config:
        orm_mode = True
