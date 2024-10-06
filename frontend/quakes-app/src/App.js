import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import './App.css';
import logo from './quakes_near_me.JPG';
import ReactMapGL, { Marker, NavigationControl } from 'react-map-gl';
import { bbox } from '@turf/turf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

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

  // Use pagination for list
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = geojsonData ? geojsonData.features.slice(startIndex, endIndex) : [];

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
          transitionDuration: 1000, // Smooth transition
        });
        setIsViewportSet(true); // Mark viewport as set
      }
    } catch (error) {
      console.error('Error loading GeoJSON data:', error);
    }
  }, [isViewportSet, viewport]); // Add dependencies

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
      const response = await api.get('/save_quakes_to_geojson/');
      setFetchMessage(response.data.message);
    } catch (error) {
      console.error('Saving to GeoJSON failed: ', error);
      setFetchMessage("Error saving to GeoJSON");
    }
  };

  const handleViewportChange = (newViewport) => {
    setViewport(newViewport); // Update the viewport state
  };

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
            zoom: 10, // Adjust zoom to show the user's location
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

  // Functions to handle pagination of table
  const nextPage = () => {
    if (geojsonData && currentPage < Math.ceil(geojsonData.features.length / itemsPerPage) - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Sorting function
  const onSort = (columnKey) => {
    let direction = 'ascending';
    if (sortConfig.key === columnKey && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Sorted and paginated data
  const sortedData = React.useMemo(() => {
    if (!geojsonData || !geojsonData.features) return []; // Check if geojsonData is available

    let sortableData = [...geojsonData.features];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a.properties[sortConfig.key];
        const bValue = b.properties[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableData.slice(startIndex, endIndex);
  }, [geojsonData, sortConfig, startIndex, endIndex]);


  const getMarkerSize = (magnitude) => {
    if (magnitude < -1.0) return 5;
    if (magnitude < 0.0) return 10;
    if (magnitude < 1.0) return 15;
    if (magnitude < 2.0) return 20;
    if (magnitude < 3.0) return 30;
    if (magnitude < 4.0) return 40;
    if (magnitude < 5.0) return 45;
    if (magnitude < 6.0) return 50;
    if (magnitude < 7.0) return 55;
    if (magnitude < 8.0) return 60;
    return 70; //
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
          <button className='btn btn-primary button custom mx-3' onClick={fetchUserLocation}>
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
                  <div
                    className="map-marker"
                    style={{
                      width: `${getMarkerSize(feature.properties.magnitude)}px`,
                      height: `${getMarkerSize(feature.properties.magnitude)}px`, // Unique height based on magnitude
                      backgroundImage: `url('./earthquake.png')`, // Your icon
                      backgroundSize: 'cover', // Ensure the image covers the div
                      borderRadius: '50%', // Circular marker (if desired)
                    }}
                  ></div>
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
              <th>
                <div className="header-container">
                  <span>Place</span>
                  <button onClick={() => onSort('place')} className="sort-button">
                    {sortConfig.key === 'place' 
                      ? (sortConfig.direction === 'ascending' 
                        ? <FontAwesomeIcon icon={faSortUp} /> 
                        : <FontAwesomeIcon icon={faSortDown} />) 
                      : <FontAwesomeIcon icon={faSort} />}
                  </button>
               </div>
              </th>
              <th>
                <div className="header-container">
                  <span>Magnitude</span>
                  <button onClick={() => onSort('magnitude')} className="sort-button">
                    {sortConfig.key === 'magnitude' 
                      ? (sortConfig.direction === 'ascending' 
                        ? <FontAwesomeIcon icon={faSortUp} /> 
                        : <FontAwesomeIcon icon={faSortDown} />) 
                      : <FontAwesomeIcon icon={faSort} />}
                  </button>
                </div>
             </th>
              <th>
                <div className="header-container">
                  <span>Magnitude Type</span>
                  <button onClick={() => onSort('magnitude_type')} className="sort-button">                  
                  {sortConfig.key === 'magnitude_type'
                    ? (sortConfig.direction === 'ascending'
                     ? <FontAwesomeIcon icon={faSortUp} />
                     : <FontAwesomeIcon icon={faSortDown} />)
                    : <FontAwesomeIcon icon={faSort} />}
                  </button>
                </div>
              </th>
              <th>
                <div className="header-container">
                  <span>Longitude</span>
                  <button onClick={() => onSort('longitude')} className="sort-button">                  
                  {sortConfig.key === 'longitude'
                    ? (sortConfig.direction === 'ascending'
                     ? <FontAwesomeIcon icon={faSortUp} />
                     : <FontAwesomeIcon icon={faSortDown} />)
                    : <FontAwesomeIcon icon={faSort} />}
                  </button>
                </div>
              </th>
              <th>
                <div className="header-container">
                  <span>Latitude</span>
                  <button onClick={() => onSort('latitude')} className="sort-button">                  
                  {sortConfig.key === 'latitude'
                    ? (sortConfig.direction === 'ascending'
                     ? <FontAwesomeIcon icon={faSortUp} />
                     : <FontAwesomeIcon icon={faSortDown} />)
                    : <FontAwesomeIcon icon={faSort} />}
                  </button>
                </div>
              </th>
              <th>
                <div className="header-container">
                  <span>Depth </span>
                  <button onClick={() => onSort('depth')} className="sort-button">                  
                  {sortConfig.key === 'depth'
                    ? (sortConfig.direction === 'ascending'
                     ? <FontAwesomeIcon icon={faSortUp} />
                     : <FontAwesomeIcon icon={faSortDown} />)
                    : <FontAwesomeIcon icon={faSort} />}
                  </button>
                </div>
              </th>
              <th>
                <div className="header-container">
                  <span>Origin Time (UTC)</span>
                  <button onClick={() => onSort('utc_time')} className="sort-button">                  
                  {sortConfig.key === 'utc_time'
                    ? (sortConfig.direction === 'ascending'
                     ? <FontAwesomeIcon icon={faSortUp} />
                     : <FontAwesomeIcon icon={faSortDown} />)
                    : <FontAwesomeIcon icon={faSort} />}
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((feature, index) => (
              <tr key={index}>
                <td>{feature.properties.place}</td>
                <td>{feature.properties.magnitude.toFixed(2)}</td>
                <td>{feature.properties.magnitude_type}</td>
                <td>{feature.geometry.coordinates[0].toFixed(2)}</td> {/* Longitude */}
                <td>{feature.geometry.coordinates[1].toFixed(2)}</td> {/* Latitude */}
                <td>{feature.geometry.depth.toFixed(2)}</td>
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
            disabled={!geojsonData || currentPage >= Math.ceil(geojsonData.features.length / itemsPerPage) - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
