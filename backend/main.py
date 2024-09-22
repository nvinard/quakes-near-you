from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, db_dependency
from models import models
from crud import crud
from schemas import schemas
from external_data.events import Events
from typing import List

app = FastAPI()

origins = [
    'http://localhost:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine, checkfirst=True)

fetcher = Events()

@app.post("/fetch_and_store_fdsn_earthquakes/")
def fetch_and_store(db: db_dependency):
    data = fetcher.fetch_events("FDSN")
    features = data.get("features")
    
    print(f"Fetched {len(features)} earthquakes")

    for item in features:
            
        earthquake_data = schemas.EarthquakeBase(
            longitude = item.get('geometry').get('coordinates')[0],
            latitude = item.get('geometry').get('coordinates')[1],
            depth = item.get('geometry').get('coordinates')[2],
            magnitude = item.get('properties').get('mag'),
            place = item.get('properties').get('place'),
            origin_time = item.get('properties').get('time'),
            magnitude_type = item.get('properties').get('magType'),
            title = item.get('properties').get('title')
        )
        
        crud.create_earthquake(db, earthquake_data)
        
    db.commit()
    
    return {"message": f"Fetched {len(features)} earthquake and stored successfully",
            "message2": "Data fetched from FDSN and stored successfully"}

@app.post("/earthquakes/", response_model=schemas.EarthquakeModel)
def create_earthquake(earthquake: schemas.EarthquakeBase, db: db_dependency):
    return crud.create_earthquake(db, earthquake)


@app.get("/earthquakes/", response_model=List[schemas.EarthquakeModel])
async def read_earthquakes(db: db_dependency, skip: int=0, limit: int=10):
    earthquakes = db.query(models.Earthquakes).offset(skip).limit(limit).all()
    return earthquakes