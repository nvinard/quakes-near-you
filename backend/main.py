from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

import datetime

from database.database import engine, db_dependency
from models import models
from crud import crud
from schemas import schemas
from typing import List

from external_data.events import Events
from geojson.geojson import ToGeojson

app = FastAPI()

origins = [
    'http://localhost:3000',
    'https://quakes-near-me.herokuapp.com'
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
GeoWriter = ToGeojson()

def ms_to_utc(ts):
    utc = datetime.datetime.fromtimestamp(ts/1000.0, tz=datetime.timezone.utc)
    return utc.strftime("%Y-%m-%d %H:%M:%S")

@app.post("/fetch_and_store_fdsn_earthquakes/")
def fetch_and_store(db: db_dependency):
    data = fetcher.fetch_events("FDSN")
    features = data.get("features", [])
    
    print(f"Fetched {len(features)} earthquakes")

    for item in features:
        try:
            coordinates = item.get('geometry', {}).get('coordinates', [0, 0, 0])
            properties = item.get('properties', {})
            
            earthquake_data = schemas.EarthquakeBase(
                id=item.get('id', ''),
                magnitude=properties.get('mag', 0.0),
                latitude=coordinates[1],
                longitude=coordinates[0],
                depth=coordinates[2],
                place=properties.get('place', ''),
                origin_time=properties.get('time', 0),
                utc_time=ms_to_utc(properties.get('time', 0)),
                magnitude_type=properties.get('magType', ''),
                title=properties.get('title', '')
            )
            
            crud.create_or_update_earthquake(db, earthquake_data)
        except Exception as e:
            print(f"Error processing earthquake ID {item.get('id')}: {e}")
            continue  # Continue processing other records even if one fails
        
    db.commit()
    
    return {
        "message": f"Fetched {len(features)} earthquakes and stored successfully",
        "details": "Data fetched from FDSN and stored successfully."
    }

@app.post("/earthquakes/", response_model=schemas.EarthquakeModel)
def create_earthquake(earthquake: schemas.EarthquakeBase, db: db_dependency):
    return crud.create_or_update_earthquake(db, earthquake)


@app.get("/earthquakes/", response_model=List[schemas.EarthquakeModel])
async def read_earthquakes(db: db_dependency, skip: int=0, limit: int=10):
    earthquakes = db.query(models.Earthquakes).offset(skip).limit(limit).all()
    return earthquakes

@app.get("/save_quakes_to_geojson/")
async def save_quakes_to_geojson():
    quake_dict = GeoWriter.read_earthquakes(limit=None)
    data = GeoWriter.dict_to_geojson(quake_dict)
    GeoWriter.save_geojson_to_file(data, "../quakes-app/public/earthquakes.geojson")

app.mount("/static", StaticFiles(directory="../quakes-app/build/static"), name="static")

@app.get("/")
async def root():
    return FileResponse("../quakes-app/build/index.html")