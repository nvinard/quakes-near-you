import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './quakes_near_me.JPG';
import ReactMapGL, { Marker, NavigationControl } from 'react-map-gl';
import { FlyToInterpolator } from 'mapbox-gl';
import { bbox } from '@turf/turf';

const App = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 1,
  });

  // Fetch the GeoJSON file
  const fetchGeojson = async () => {
    try {
      const response = await fetch('/earthquakes.geojson'); // Use correct relative path
      const data = await response.json();
      setGeojsonData(data);
      if (data.features && data.features.length > 0) {
        // Calculate the bounding box of all features
        const boundingBox = bbox(data);
        const [minLng, minLat, maxLng, maxLat] = boundingBox;

        setViewport({
          ...viewport,
          latitude: (minLat + maxLat) / 2, // Correct latitude
          longitude: (minLng + maxLng) / 2, // Correct longitude
          zoom: 2, // Adjust zoom level as needed
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator(),
        });
      }
    } catch (error) {
      console.error('Error loading GeoJSON data:', error);
    }
  };

  useEffect(() => {
    fetchGeojson();
  }, []);

  return (
    <div>
      <nav className='navbar navbar-dark navbar-custom'>
        <div className='container-fluid'>
        <a className='navbar-brand' href="/home">
        <img src={logo} alt="Logo" />
        Earthquakes near me
        </a>
        </div>
      </nav>

      <div className='container'>
        <div className='map-container'>
          <ReactMapGL
            {...viewport}
            width="100%"
            height="100%" // Fill the map container
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            onViewportChange={(newViewport) => setViewport(newViewport)}
            mapStyle="mapbox://styles/mapbox/streets-v11"
          >
            {geojsonData && geojsonData.features.map((feature, index) => (
              <Marker
                key={index}
                latitude={feature.geometry.coordinates[1]} // Correct latitude
                longitude={feature.geometry.coordinates[0]} // Correct longitude
                anchor="bottom"
              >
                <div className="map-marker">
                </div>
              </Marker>
            ))}

            <div style={{ position: 'absolute', right: 10, top: 10 }}>
              <NavigationControl />
            </div>
          </ReactMapGL>
        </div>

        <table className='table table-striped table-bordered table-hover'>
          <thead>
            <tr>
              <th>Magnitude</th>
              <th>Magnitude Type</th>
              <th>Longitude</th>
              <th>Latitude</th>
              <th>Depth</th>
              <th>Place</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {geojsonData && geojsonData.features.map((feature, index) => (
              <tr key={index}>
                <td>{feature.properties.magnitude}</td>
                <td>{feature.properties.magnitude_type}</td>
                <td>{feature.geometry.coordinates[0]}</td> {/* Longitude */}
                <td>{feature.geometry.coordinates[1]}</td> {/* Latitude */}
                <td>{feature.properties.depth}</td>
                <td>{feature.properties.place}</td>
                <td>{feature.properties.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
