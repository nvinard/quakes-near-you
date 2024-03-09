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

quakes_data = response.json()
quakes_data = json.dumps(quakes_data, indent=4)

df_quakes = pd.DataFrame(quakes_data.get('data'))
df_quakes.to_csv('quakes.csv')