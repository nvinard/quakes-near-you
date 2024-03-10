from datetime import datetime, timedelta
import pandas as pd
import requests
import json

end_time = datetime.today().strftime('%Y-%m-%d')
start_time = datetime.today() - timedelta(days=1)
start_time = start_time.strftime('%Y-%m-%d')

method = ""
parameters = ""
us_gov_url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime={}&endtime={}".format(
    start_time,
    end_time
)

response = requests.get(us_gov_url)

data = response.json()

df = pd.json_normalize(data['features'])

df.to_csv('quakes.csv')