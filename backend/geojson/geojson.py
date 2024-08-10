from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from models import Earthquakes


URL_DATABASE = 'sqlite:///./quakes_near_me.db'
engine = create_engine(URL_DATABASE, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
        
        # Check the number of records fetched
        print(f"Fetched {len(earthquakes)} records.")
        
        return earthquakes
    except Exception as e:
        print(f"An error occurred: {e}")
        return []
    finally:
        db.close()

# Fetch and print the earthquakes
quakes = read_earthquakes()
print(quakes)

def df_to_geojson(dictionary):
    # create a new python dict to contain our geojson data, using geojson format
    geojson = {'type': 'FeatureCollection', 'features': []}
    
    # loop through each row in the dataframe 
    for key, value in dictionary.items():
        # create a feature template to fill in
        feature = {'type': 'Feature', 
                   'properties': {},
                   'geometry': {'type':'Polygon',
                                'coordinates':[]}}
        
        # fill in the coordinates 
        feature['geometry']['coordinates'] = [value]
        
        # create properies with region id
        feature['properties']['region'] = key + 1
        # add this feature (convert dataframe row) to the list of features inside our dict
        geojson['features'].append(feature)
    
    return geojson