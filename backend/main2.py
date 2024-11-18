import os
import json
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from external_data.events import Events

app = FastAPI()

origins = [
    'http://localhost:3000',
    'http://frontend:3000',
    'https://quakesnearme.com',
    'http://quakesnearme.com',
    'https://673a68f4057182500a3b9d6d--sparkly-sable-9b671f.netlify.app',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


fetcher = Events()

geojson_file_path = os.path.join(os.path.dirname(__file__), "earthquakes.geojson")

def ms_to_utc(ts):
    utc = datetime.datetime.fromtimestamp(ts / 1000.0, tz=datetime.timezone.utc)
    return utc.strftime("%Y-%m-%d %H:%M:%S")

@app.post("/fetch_and_save_fdsn_earthquakes/")
def fetch_and_save():
    data = fetcher.fetch_events("FDSN")
    features = data.get("features", [])
    
    print(f"Fetched {len(features)} earthquakes at {datetime.datetime.utcnow()}")

    geojson_data = {
        "type": "FeatureCollection",
        "features": []
    }

    for item in features:
        try:
            coordinates = item.get('geometry', {}).get('coordinates', [0, 0, 0])
            properties = item.get('properties', {})
            
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': "Point",
                    'coordinates': [coordinates[0], coordinates[1]],
                    'depth': coordinates[2]
                },
                'properties': {
                    'title': properties.get('title', ''),
                    'place': properties.get('place', ''),
                    'magnitude': properties.get('mag', ''),
                    'magnitude_type': properties.get('magType', ''),
                    'utc_time': ms_to_utc(properties.get('time', 0))
                }
            }

            geojson_data["features"].append(feature)

        except Exception as e:
            print(f"Error processing earthquake ID {item.get('id')}: {e}")
            continue
        
    os.makedirs(os.path.dirname(geojson_file_path), exist_ok=True)
    print(geojson_file_path)
    with open(geojson_file_path, 'w') as geojson_file:
        json.dump(geojson_data, geojson_file, indent=2)
    print("Earthquake data saved to GeoJSON file")


def scheduled_task():
    print(f"Scheduled task triggered at {datetime.datetime.utcnow()}")
    fetch_and_save()
    print(f"Scheduled fetch completed")

@app.on_event("startup")
async def startup_event():
    print("initlaizing scheduler...")
    scheduler = AsyncIOScheduler()  # Changed to AsyncIOScheduler
    scheduler.add_job(scheduled_task, 'interval', minutes=15)
    scheduler.start()
    print("Scheduled task started to fetch and save earthquakes every minute")

    # Ensure scheduler shuts down gracefully
    import atexit
    atexit.register(lambda: scheduler.shutdown())

@app.get("/api/earthquakes.geojson")
async def get_geojson_file():
    return FileResponse(geojson_file_path)

@app.get("/")
async def root():
    return {"message": "Backend is running"}

@app.head("/")
def read_root_head():
    return None

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

