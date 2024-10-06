import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import './App.css';
import logo from './quakes_near_me.JPG';
import ReactMapGL, { Marker, NavigationControl } from 'react-map-gl';
import { bbox } from '@turf/turf';

const App = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [fetchMessage, setFetchMessage] = useState('');
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 1,
  });

  const [isViewportSet, setIsViewportSet] = useState(false); // To prevent resetting after initial load
  const [userLocation, setUserLocation] = useState(null); // State for user location

  // use pagination for list
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = geojsonData ? geojsonData.features.slice(startIndex, endIndex) : [];
  

  // Fetch the GeoJSON file
  const fetchGeojson = useCallback(async () => {
    try {
      const response = await fetch('earthquakes.geojson'); // Use correct relative path
      const data = await response.json();
      setGeojsonData(data);

      if (data.features && data.features.length > 0 && !isViewportSet) {
        // Calculate the bounding box of all features only if the viewport is not set yet
        const boundingBox = bbox(data);
        const [minLng, minLat, maxLng, maxLat] = boundingBox;

        setViewport({
          ...viewport,
          latitude: (minLat + maxLat) / 2, // Correct latitude
          longitude: (minLng + maxLng) / 2, // Correct longitude
          zoom: 2, // Adjust zoom level as needed
          transitionDuration: 1000, // Smooth transition, no FlyToInterpolator
        });
        setIsViewportSet(true); // Mark viewport as set
      }
    } catch (error) {
      console.error('Error loading GeoJSON data:', error);
    }
  }, [isViewportSet, viewport]); // Add dependencies so it only runs when needed

  useEffect(() => {
    fetchGeojson();
  }, [fetchGeojson]); // Only run fetch once on mount


  const handleFetchLatestData = async () => {
    try {
      const response = await api.post('/fetch_and_store_fdsn_earthquakes/');
      setFetchMessage(response.data.message);
    } catch (error) {
      console.error('Error fetching latest data:', error);
      setFetchMessage('Error fetching latest data');
    }
  };

  const saveToGeojson = async () => {
    try {
      const reponse = await api.get('/save_quakes_to_geojson/');
      setFetchMessage(reponse.data.message);
    } catch (error) {
      console.error('Saving to geojon failed: ', error);
      setFetchMessage("Error saving to Geojson");
    }
  };


  const handleViewportChange = (newViewport) => {
    console.log("New viewport:", newViewport); // Make sure 'newViewport' is the correct variable
    setViewport(newViewport); // Update the viewport state
  };

  // get user location
  
  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setViewport((prevViewport) => ({
            ...prevViewport,
            latitude: latitude,
            longitude: longitude,
            zoom: 10, // Adjust zoom to show the user's location more clearly
            transitionDuration: 1000, // Smooth transition to user's location
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

  // functions to handle pagination of table
  const nextPage = () => {
    if (geojsonData && currentPage < Math.ceil(geojsonData.features.length / itemsPerPage) -1 ) {
      setCurrentPage(currentPage + 1);
    }
  };
  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };


  return (
    <div>
      <nav className='navbar navbar-dark navbar-custom'>
        <div className='container-fluid'>
          <a className='navbar-brand' href="/home">
            <img src={logo} alt="Logo" />
            Earthquakes near you
          </a>
        </div>
      </nav>

      <div className='container'>
        <div className="d-flex align items-center my-3">
          <button className='btn btn-primary button custom' onClick={handleFetchLatestData}>
            Fetch latest earthquakes
          </button>
          <button className='btn btn-primary buttom custom mx-3' onClick={fetchUserLocation}>
            Use my location
          </button>
          <span className='mx-3'>{fetchMessage}</span>
          <button className='btn btn-primary button custom mx-3' onClick={saveToGeojson}>
            Save data to Geojson
          </button>
        </div>

        <div className='map-container'>
          <ReactMapGL
            {...viewport}
            width="80%"
            height="100%" 
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            onMove={(evt) => setViewport(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            scrollZoom={true}
            doubleClickZoom={true}
            dragPan={true}
            dragRotate={true}
            interactive={true} // Optional, explicitly ensure interactivity
          >
            {geojsonData && geojsonData.features.map((feature, index) => (
              feature.geometry && feature.geometry.coordinates && (
                <Marker
                  key={index}
                  latitude={feature.geometry.coordinates[1]} // Correct latitude
                  longitude={feature.geometry.coordinates[0]} // Correct longitude
                  anchor="bottom"
                >
                  <div className="map-marker"></div>
                </Marker>
              )
            ))}

            {userLocation && (
              <Marker latitude={userLocation.latitude} longitude={userLocation.longitude}>
                <div className="user-location-marker"></div>
              </Marker>
            )}

            <div style={{ position: 'absolute', right: 10, top: 10 }}>
              <NavigationControl />
            </div>
          </ReactMapGL>
        </div>

        <table className='table table-striped table-bordered table-hover'>
          <thead>
            <tr>
              <th>Place</th>
              <th>Magnitude</th>
              <th>Magnitude Type</th>
              <th>Longitude</th>
              <th>Latitude</th>
              <th>Depth</th>
              <th>Origin Time (UTC)</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((feature, index) => (
              <tr key={index}>
                <td>{feature.properties.place}</td>
                <td>{feature.properties.magnitude}</td>
                <td>{feature.properties.magnitude_type}</td>
                <td>{feature.geometry.coordinates[0]}</td> {/* Longitude */}
                <td>{feature.geometry.coordinates[1]}</td> {/* Latitude */}
                <td>{feature.geometry.depth}</td>
                <td>{feature.properties.utc_time}</td>
                
            </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination-controls">
          <button onClick={previousPage} disabled={currentPage === 0}>
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={!geojsonData || currentPage >= Math.ceil(geojsonData.features.length / itemsPerPage) -1}
            >
              Next
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;
