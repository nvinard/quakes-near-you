import os
import sys
import json
import datetime
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, MetaData, Table, Column, String, Float, DateTime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import text
from sqlalchemy.exc import IntegrityError
from external_data.events import Events

load_dotenv()

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

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Initialize engine and metadata
engine = None
SessionLocal = None
metadata = MetaData()
earthquakes = Table(
    "earthquakes",
    metadata,
    Column("id", String, primary_key=True),
    Column("place", String),
    Column("magnitude", Float),
    Column("magnitude_type", String),
    Column("latitude", Float),
    Column("longitude", Float),
    Column("depth", Float),
    Column("utc_time", DateTime),
)

def init_database():
    global engine, SessionLocal
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        metadata.create_all(engine)
        print("Database connection established successfully")
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

fetcher = Events()

geojson_file_path = os.path.join(os.path.dirname(__file__), "earthquakes.geojson")
def ms_to_utc(ts):
    utc = datetime.datetime.fromtimestamp(ts / 1000.0, tz=datetime.timezone.utc)
    return utc.strftime("%Y-%m-%d %H:%M:%S")

@app.on_event("startup")
def create_tables():
    # Initialize database connection
    import time
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        if init_database():
            print("Database initialized successfully")
            break
        retry_count += 1
        print(f"Database connection attempt {retry_count}/{max_retries} failed. Retrying in 2 seconds...")
        time.sleep(2)
    
    if retry_count >= max_retries:
        print("Failed to connect to database after maximum retries")
        return
    
    # For local development, fetch earthquake data on startup
    try:
        fetch_and_save()
        print("Initial earthquake data loaded on startup")
    except Exception as e:
        print(f"Could not fetch initial data on startup: {e}")


@app.post("/fetch_and_save_fdsn_earthquakes/")
def fetch_and_save():
    data = fetcher.fetch_events()
    features = data.get("features", [])

    print(f"Fetched {len(features)} earthquakes at {datetime.datetime.utcnow()}")

    with engine.connect() as conn:
        # Clear the existing data
        conn.execute(text("DELETE FROM earthquakes"))

        for item in features:
            try:
                coordinates = item.get("geometry", {}).get("coordinates", [0, 0, 0])
                properties = item.get("properties", {})

                conn.execute(
                    earthquakes.insert().values(
                        id=item.get("id", ""),
                        place=properties.get("place", ""),
                        magnitude=properties.get("mag", 0.0),
                        magnitude_type=properties.get("magType", ""),
                        latitude=coordinates[1],
                        longitude=coordinates[0],
                        depth=coordinates[2],
                        utc_time=datetime.datetime.fromtimestamp(
                            properties.get("time", 0) / 1000.0, tz=datetime.timezone.utc
                        ),
                    )
                )
            except Exception as e:
                print(f"Error processing earthquake ID {item.get('id')}: {e}")

    print("Earthquake data saved to the database.")

# API endpoint to serve the GeoJSON data dynamically
@app.get("/api/earthquakes.geojson")
async def get_geojson_file():
    if engine is None:
        return JSONResponse(content={"error": "Database not connected"}, status_code=503)
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM earthquakes")).fetchall()

        geojson_data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [row.longitude, row.latitude, row.depth],
                    },
                    "properties": {
                        "place": row.place,
                        "magnitude": row.magnitude,
                        "magnitude_type": row.magnitude_type,
                        "utc_time": row.utc_time.strftime("%Y-%m-%d %H:%M:%S"),
                    },
                }
                for row in result
            ],
        }
        return JSONResponse(content=geojson_data)
    except Exception as e:
        print(f"Error fetching earthquake data: {e}")
        return JSONResponse(content={"error": "Failed to fetch earthquake data"}, status_code=500)

# Health check endpoint
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Backend is running"}


# Run a fetch manually if triggered by Heroku Scheduler or CLI
if __name__ == "__main__":
    if "fetch" in sys.argv:
        print("Running fetch_and_save...")
        fetch_and_save()