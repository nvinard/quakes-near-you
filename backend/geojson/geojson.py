# geojson.py
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from models.models import Earthquakes
from database.database import engine, SessionLocal  # Import the centralized engine and session
import json

class ToGeojson:
    def __init__(self):
        # Use the centralized engine and session
        self.engine = engine
        self.SessionLocal = SessionLocal

    def object_as_dict(self, obj):
        """Convert SQLAlchemy object to dictionary"""
        return {column.key: getattr(obj, column.key) for column in obj.__table__.columns}
    
    def list_tables(self):
        """List all tables in the database."""
        inspector = inspect(self.engine)
        tables = inspector.get_table_names()
        print("Tables in the database:", tables)
        return tables
    
    def read_earthquakes(self, skip: int = 0, limit: int = 10):
        db: Session = self.SessionLocal()
        try:
            # Print debug information
            print("Connected to the database.")

            # Check if the table exists using the inspect module
            inspector = inspect(self.engine)
            if not inspector.has_table(Earthquakes.__tablename__):
                print(f"Table '{Earthquakes.__tablename__}' does not exist.")
                return []
            
            # Query the data
            query = db.query(Earthquakes)
            if skip:
                query = query.offset(skip)
            if limit:
                query = query.limit(limit)
            earthquakes = query.all()
            earthquakes_dict = [self.object_as_dict(quake) for quake in earthquakes]

            # Check the number of records fetched
            print(f"Fetched {len(earthquakes)} records from db.")
            
            return earthquakes_dict
        except Exception as e:
            print(f"An error occurred: {e}")
            return []
        finally:
            db.close()

    def dict_to_geojson(self, dictionary):
        # Create a new Python dict to contain our GeoJSON data, using GeoJSON format
        geojson = {'type': 'FeatureCollection', 'features': []}
        
        # Loop through each earthquake record
        for quake in dictionary:
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': "Point",
                    'coordinates': [quake['longitude'], quake['latitude']],
                    'depth': quake['depth']
                },
                'properties': {
                    'title': quake['title'],
                    'place': quake['place'],
                    'magnitude': quake['magnitude'],
                    'magnitude_type': quake['magnitude_type']
                }
            }
            geojson['features'].append(feature)
        
        return geojson

    def save_geojson_to_file(self, geojson_data, filename):
        with open(filename, 'w') as geojson_file:
            json.dump(geojson_data, geojson_file, indent=2)
