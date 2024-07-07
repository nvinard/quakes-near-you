from sqlalchemy.orm import Session
from backend.models import models
from backend.schemas import schemas

def create_earthquake(db: Session, earthquake: schemas.EarthquakeBase):
    db_earthquake = models.Earthquakes(
        magnitude=earthquake.magnitude,
        latitude=earthquake.latitude,
        longitude=earthquake.longitude,
        depth=earthquake.depth,
        place=earthquake.place,
        origin_time=earthquake.origin_time,
        magnitude_type=earthquake.magnitude_type,
        title=earthquake.title
    )
    db.add(db_earthquake)
    db.commit()
    db.refresh(db_earthquake)
    return db_earthquake