from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from backend.models.models import Earthquakes
import json


URL_DATABASE = 'sqlite:///./../quakes_near_me.db'
engine = create_engine(URL_DATABASE, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def object_as_dict(obj):
    """Convert sqlalchemy object to dictonary"""
    return {column.key: getattr(obj, column.key) for column in obj.__table__.columns}

def read_earthquakes(skip: int = 0, limit: int = 10):
    db = SessionLocal()
    try:
        # Print debug information
        print("Connected to the database.")

        # Check if the table exists using the inspect module
        inspector = inspect(engine)
        if not inspector.has_table(Earthquakes.__tablename__):
            print(f"Table {Earthquakes.__tablename__} does not exist.")
            return []
        
        # Query the data
        earthquakes = db.query(Earthquakes).offset(skip).limit(limit).all()
        earthquakes_dict = [object_as_dict(quake) for quake in earthquakes]

        # Check the number of records fetched
        print(f"Fetched {len(earthquakes)} records from db.")
        
        return earthquakes_dict
    except Exception as e:
        print(f"An error occurred: {e}")
        return []
    finally:
        db.close()

def dict_to_geojson(dictionary):
    # create a new python dict to contain our geojson data, using geojson format
    geojson = {'type': 'FeatureCollection', 'features': []}
    
    # loop through each row in the dataframe 
    for quake in dictionary:
        # create a feature template to fill in
        feature = {'type': 'Feature',
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
        
        # fill in the coordinates 
        feature['geometry']['coordinates'] = [quake['longitude'], quake['latitude']]
        feature['geometry']['depth'] = quake['depth']
        
        # create properties
        feature['properties']['title'] = quake['title']
        feature['properties']['place'] = quake['place']
        feature['properties']['magnitude'] = quake['magnitude']
        feature['properties']['magnitude_type'] = quake['magnitude_type']

        # add this feature (convert dataframe row) to the list of features inside our dict
        geojson['features'].append(feature)
    
    return geojson


def save_geojson_to_file(geojson_data, filename):
    with open(filename, 'w') as geojson_file:
        json.dump(geojson_data, geojson_file, indent=2)
