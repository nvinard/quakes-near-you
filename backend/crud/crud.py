from sqlalchemy.orm import Session
from ..models import models
from ..schemas import schemas

def create_or_update_earthquake(db: Session, earthquake: schemas.EarthquakeBase):

    existing_earthquake = db.query(models.Earthquakes).filter(models.Earthquakes.id == earthquake.id).first()
    if existing_earthquake:
        # update record
        existing_earthquake.magnitude=earthquake.magnitude
        existing_earthquake.latitude=earthquake.latitude
        existing_earthquake.longitude=earthquake.longitude
        existing_earthquake.depth=earthquake.depth
        existing_earthquake.place=earthquake.place
        existing_earthquake.origin_time=earthquake.origin_time
        existing_earthquake.utc_time=earthquake.utc_time
        existing_earthquake.magnitude_type=earthquake.magnitude_type
        existing_earthquake.title=earthquake.title
        db.commit()
        db.refresh(existing_earthquake)
        
        return existing_earthquake
    
    
    db_earthquake = models.Earthquakes(
        magnitude=earthquake.magnitude,
        latitude=earthquake.latitude,
        longitude=earthquake.longitude,
        depth=earthquake.depth,
        place=earthquake.place,
        origin_time=earthquake.origin_time,
        utc_time=earthquake.utc_time,
        magnitude_type=earthquake.magnitude_type,
        title=earthquake.title,
        id=earthquake.id
    )

    db.add(db_earthquake)
    db.commit()
    db.refresh(db_earthquake)
    return db_earthquake