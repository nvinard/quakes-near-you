import React, { useState, useEffect, useCallback } from 'react';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { bbox } from '@turf/turf';
import './EarthquakeMap.css';

const EarthquakeMap = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 1,
  });
  const [isViewportSet, setIsViewportSet] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null); // Hover state for tooltip
  const [geojsonFetched, setGeojsonFetched] = useState(false);

  const fetchGeojson = useCallback(async () => {
    if (!geojsonFetched) {
      try {
        const url = `${window.REACT_APP_API_URL}/api/earthquakes.geojson?v=` + new Date().getTime();
        const response = await fetch(url);
        const data = await response.json();
        setGeojsonData(data);
        setGeojsonFetched(true);

        if (data.features && data.features.length > 0 && !isViewportSet) {
          const boundingBox = bbox(data);
          const [minLng, minLat, maxLng, maxLat] = boundingBox;
          setViewport({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            zoom: 2,
            transitionDuration: 1000,
          });
          setIsViewportSet(true);
        }
      } catch (error) {
        alert('Failed to load earthquake data. Please try again later.');
      }
    }
  }, [geojsonFetched, isViewportSet]);

  useEffect(() => {
    if (geojsonFetched) {
      const timerId = setTimeout(() => {
        setGeojsonFetched(false);
      }, 60000);
      return () => clearTimeout(timerId);
    }
  }, [geojsonFetched]);

  useEffect(() => {
    fetchGeojson();
  }, [fetchGeojson]);

  const handleViewportChange = (newViewport) => {
    setViewport(newViewport);
  };

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setViewport((prevViewport) => ({
            ...prevViewport,
            latitude,
            longitude,
            zoom: 10,
            transitionDuration: 1000,
          }));
        },
        (error) => {
          console.error('Error fetching user location:', error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const getMarkerSize = (magnitude) => {
    if (magnitude < 0.0) return 10;
    if (magnitude < 1.0) return 15;
    if (magnitude < 2.0) return 20;
    if (magnitude < 3.0) return 30;
    if (magnitude < 4.0) return 40;
    if (magnitude < 5.0) return 50;
    if (magnitude < 6.0) return 60;
    if (magnitude < 7.0) return 70;
    if (magnitude < 8.0) return 90;
    return 120;
  };

  return (
    <div>
      <button className="btn btn-primary button custom mx-3" onClick={fetchUserLocation}>
        Use my location
      </button>

      <div className="map-container">
        <ReactMapGL
          {...viewport}
          width="100%"
          height="50vh"
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          onMove={(evt) => handleViewportChange(evt.viewState)}
          mapStyle="mapbox://styles/nvinard/cm3t2gjki004l01sif7mpdb4p"
          scrollZoom={true}
        >
          {geojsonData &&
            geojsonData.features.map((feature, index) => (
              <Marker
                key={index}
                latitude={feature.geometry.coordinates[1]}
                longitude={feature.geometry.coordinates[0]}
                anchor="bottom"
              >
                <div
                  className="map-marker"
                  style={{
                    width: `${getMarkerSize(feature.properties.magnitude)}px`,
                    height: `${getMarkerSize(feature.properties.magnitude)}px`,
                    backgroundImage: `url('./earthquake.png')`,
                    backgroundSize: 'cover',
                    borderRadius: '50%',
                  }}
                  onMouseEnter={() => setHoverInfo(feature)}
                  onMouseLeave={() => setHoverInfo(null)}
                />
              </Marker>
            ))}

          {hoverInfo && (
            <Popup
              longitude={hoverInfo.geometry.coordinates[0]}
              latitude={hoverInfo.geometry.coordinates[1]}
              closeButton={false}
              closeOnClick={false}
              anchor="top"
            >
              <div>
                <strong>{hoverInfo.properties.place}</strong>
                <div>Magnitude: {hoverInfo.properties.magnitude.toFixed(1)}</div>
                <div>Depth: {hoverInfo.geometry.coordinates[2].toFixed(1)} km</div>
                <div>Time: {hoverInfo.properties.utc_time} UTC</div>
              </div>
            </Popup>
          )}

          {userLocation && (
            <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
              <div style={{ fontSize: '30px', transform: 'translate(-50%, -100%)' }}>📍</div>
            </Marker>
          )}

          <div style={{ position: 'absolute', right: 10, top: 10 }}>
            <NavigationControl />
          </div>
        </ReactMapGL>
      </div>
    </div>
  );
};

export default EarthquakeMap;
