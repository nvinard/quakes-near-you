from datetime import datetime

def convert_emsc_time(emsc_time):
    # EMSC time is in ISO 8601 format, convert it to a timestamp in milliseconds
    dt = datetime.fromisoformat(emsc_time.rstrip('Z'))
    return int(dt.timestamp() * 1000)

def process_usgs_geojson(usgs_data):
    features = []
    
    for feature in usgs_data['features']:
        processed_feature = {
            "type": "Feature",
            "properties": {
                "mag": feature['properties']['mag'],
                "place": feature['properties']['place'],
                "time": feature['properties']['time'],
                "magType": feature['properties']['magType'],
                "type": feature['properties']['type'],
                "title": feature['properties']['title']
            },
            "geometry": feature['geometry'],
            "id": feature['id']
        }
        features.append(processed_feature)
    
    return {
        "type": "FeatureCollection",
        "metadata": usgs_data['metadata'],
        "features": features
    }

def process_emsc_geojson(emsc_data):
    features = []
    
    for feature in emsc_data['features']:
        processed_feature = {
            "type": "Feature",
            "properties": {
                "mag": feature['properties']['mag'],
                "place": feature['properties']['flynn_region'],
                "time": convert_emsc_time(feature['properties']['time']),
                "magType": feature['properties']['magtype'],
                "type": feature['properties']['evtype'],
                "title": f"M {feature['properties']['mag']} - {feature['properties']['flynn_region']}"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    feature['geometry']['coordinates'][0],
                    feature['geometry']['coordinates'][1],
                    abs(feature['geometry']['coordinates'][2])  # Convert depth to positive value
                ]
            },
            "id": feature['id']
        }
        features.append(processed_feature)
    
    return {
        "type": "FeatureCollection",
        "metadata": {
            "title": "EMSC Earthquakes",
            "count": len(features)
        },
        "features": features
    }

def combine_geojson(usgs_geojson, emsc_geojson):
    combined_features = usgs_geojson['features'] + emsc_geojson['features']
    
    combined_geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Combined Earthquakes",
            "count": len(combined_features)
        },
        "features": combined_features
    }
    
    return combined_geojson
