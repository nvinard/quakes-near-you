from datetime import datetime, timedelta
import requests
from external_data.utils import process_usgs_geojson, process_emsc_geojson, process_knmi_geojson, process_resif_geojson, process_sed_geojson, combine_geojson

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
            "KNMI": "https://rdsa.knmi.nl/fdsnws/event/1/query?format=json&starttime={}&endtime={}".format(
                self.start_time,
                self.end_time
            ),
            "RESIF": "http://ws.resif.fr/fdsnws/event/1/query?format=json&starttime={}&endtime={}".format(
                self.start_time,
                self.end_time
            ),
            "SED": "http://arclink.ethz.ch/fdsnws/event/1/query?format=text&starttime={}&endtime={}&minmagnitude=0.1".format(
                self.start_time,
                self.end_time
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

    def fetch_knmi_data(self):
        url = self.sources["KNMI"]
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            data = response.json()
            return data
        elif response.status_code == 204:  # No data
            return {"type": "FeatureCollection", "features": []}
        else:
            return response.raise_for_status()

    def fetch_resif_data(self):
        url = self.sources["RESIF"]
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            data = response.json()
            return data
        elif response.status_code == 204:  # No data
            return {"type": "FeatureCollection", "features": []}
        else:
            return response.raise_for_status()

    def fetch_sed_data(self):
        url = self.sources["SED"]
        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            # SED returns text format, convert to structured data
            lines = response.text.strip().split('\n')
            events = []
            for line in lines[1:]:  # Skip header
                if line.strip():
                    parts = line.split('|')
                    if len(parts) >= 13:  # Ensure we have all required fields
                        events.append(parts)
            return events
        elif response.status_code == 204:  # No data
            return []
        else:
            return response.raise_for_status()

    def fetch_events(self):

        usgs_data = self.fetch_usgs_data()
        emsc_data = self.fetch_emsc_data()
        knmi_data = self.fetch_knmi_data()
        resif_data = self.fetch_resif_data()
        sed_data = self.fetch_sed_data()

        usgs_data = process_usgs_geojson(usgs_data)
        emsc_data = process_emsc_geojson(emsc_data)
        knmi_data = process_knmi_geojson(knmi_data)
        resif_data = process_resif_geojson(resif_data)
        sed_data = process_sed_geojson(sed_data)

        combined_data = combine_geojson(usgs_data, emsc_data, knmi_data, resif_data, sed_data)

        return combined_data