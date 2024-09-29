from external_data.events import Events

fetcher = Events()

data = fetcher.fetch_events("FDSN")
features = data.get("features")
print(f"Fetched {len(features)} earthquakes")

for item in features:
    print("item")
    print("")