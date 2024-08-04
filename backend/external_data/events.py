from datetime import datetime, timedelta
import requests

class Events:
    def __init__(self):
        self.end_time = datetime.today().strftime('%Y-%m-%d')
        self.start_time = datetime.today() - timedelta(days=1)
        self.start_time = self.start_time.strftime('%Y-%m-%d')
        self.sources = {
            "FDSN": "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime={}&endtime={}".format(
                self.start_time,
                self.end_time
            )
        }
        
    def fetch_events(self, source):
        if source not in self.sources:
            raise ValueError(f"Source {source} is not avalid source")
        
        url = self.sources[source]
        print(url)
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            # Convert origin_time to integer
            for feature in data.get('features', []):
                feature['properties']['time'] = int(feature['properties']['time'])
            return data
        else:
            response.raise_for_status()
            
events = Events()
events.fetch_events("FDSN")