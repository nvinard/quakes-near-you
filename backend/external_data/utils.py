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

def process_knmi_geojson(knmi_data):
    features = []
    
    for feature in knmi_data.get('features', []):
        processed_feature = {
            "type": "Feature",
            "properties": {
                "mag": feature['properties'].get('mag'),
                "place": feature['properties'].get('description', 'KNMI Netherlands'),
                "time": int(datetime.fromisoformat(feature['properties']['time'].rstrip('Z')).timestamp() * 1000),
                "magType": feature['properties'].get('magType', 'unknown'),
                "type": feature['properties'].get('type', 'earthquake'),
                "title": f"M {feature['properties'].get('mag', '?')} - KNMI Netherlands"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    feature['geometry']['coordinates'][0],
                    feature['geometry']['coordinates'][1],
                    abs(feature['geometry']['coordinates'][2]) if len(feature['geometry']['coordinates']) > 2 else 0
                ]
            },
            "id": feature.get('id', f"knmi_{len(features)}")
        }
        features.append(processed_feature)
    
    return {
        "type": "FeatureCollection",
        "metadata": {
            "title": "KNMI Netherlands Earthquakes",
            "count": len(features)
        },
        "features": features
    }

def process_resif_geojson(resif_data):
    features = []
    
    for feature in resif_data.get('features', []):
        props = feature['properties']
        
        # Handle description field which can be a dict with lang keys or a string
        place = props.get('description', 'RESIF France')
        if isinstance(place, dict):
            place = place.get('en', place.get('fr', 'RESIF France'))
        
        processed_feature = {
            "type": "Feature",
            "properties": {
                "mag": props.get('mag'),
                "place": place,
                "time": int(datetime.fromisoformat(props['time'].rstrip('Z')).timestamp() * 1000),
                "magType": props.get('magType', 'unknown'),
                "type": props.get('type', 'earthquake'),
                "title": f"M {props.get('mag', '?')} - {place}"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    props['longitude'],
                    props['latitude'],
                    abs(props.get('depth', 0))
                ]
            },
            "id": feature.get('id', f"resif_{len(features)}")
        }
        features.append(processed_feature)
    
    return {
        "type": "FeatureCollection",
        "metadata": {
            "title": "RESIF France Earthquakes",
            "count": len(features)
        },
        "features": features
    }

def combine_geojson(*geojson_data):
    combined_features = []
    for geojson in geojson_data:
        combined_features.extend(geojson['features'])
    
    combined_geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Combined Earthquakes",
            "count": len(combined_features)
        },
        "features": combined_features
    }
    
    return combined_geojson
