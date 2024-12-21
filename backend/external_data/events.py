from datetime import datetime, timedelta
import requests
from external_data.utils import process_usgs_geojson, process_emsc_geojson, combine_geojson

class Events:
    def __init__(self):
        self.end_time = datetime.now().strftime('%Y-%m-%dT%H:%M:%S') # datetime.today().strftime('%Y-%m-%d')
        self.start_time = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%S') # datetime.today() - timedelta(days=1)
        self.sources = {
            "USGS": "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime={}&endtime={}".format(
                self.start_time,
                self.end_time
            ),
            "EMSC": "https://www.seismicportal.eu/fdsnws/event/1/query?limit={}&start={}&end={}&format={}".format(
                20000,
                self.start_time,
                self.end_time,
                "json"
            ),
        }

    def fetch_usgs_data(self):
        url = self.sources["USGS"]
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            # Convert origin_time to integer
            for feature in data.get('features', []):
                feature['properties']['time'] = int(feature['properties']['time'])
            return data
        else:
            return response.raise_for_status()
        
    def fetch_emsc_data(self):
        url = self.sources["EMSC"]
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            return response.raise_for_status()


        
    def fetch_events(self):

        usgs_data = self.fetch_usgs_data()
        emsc_data = self.fetch_emsc_data()

        usgs_data = process_usgs_geojson(usgs_data)
        emsc_data = process_emsc_geojson(emsc_data)

        combined_data = combine_geojson(usgs_data, emsc_data)

        return combined_data