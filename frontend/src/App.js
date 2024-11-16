import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import './App.css';
import logo from './quakes_near_me.JPG';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { bbox } from '@turf/turf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const App = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 1,
  });

  const [isViewportSet, setIsViewportSet] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hoverInfo, setHoverInfo] = useState(null); // Hover state for tooltip
  const itemsPerPage = 20;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [geojsonFetched, setGeojsonFetched] = useState(false);

  // Fetch GeoJSON data only once
  const fetchGeojson = useCallback(async () => {
    if (!geojsonFetched) {  // Prevent multiple fetches
      try {
        const url = `${window.REACT_APP_API_URL}/api/earthquakes.geojson?v=` + new Date().getTime();
        console.log("Fetching GeoJSON data from:", url);

        const response = await fetch(url);
        const data = await response.json(); // Assign fetched data to 'data'
        console.log(data);

        setGeojsonData(data); // Save data to state
        setGeojsonFetched(true); // Mark data as fetched

        if (data.features && data.features.length > 0 && !isViewportSet) {
          const boundingBox = bbox(data);
          const [minLng, minLat, maxLng, maxLat] = boundingBox;

          setViewport({
            ...viewport,
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            zoom: 2,
            transitionDuration: 1000,
          });
          setIsViewportSet(true);
        }
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
      }
    }
  }, [geojsonFetched, isViewportSet, viewport]);

  // reset geojsonfetched every minute
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
    console.log("GeoJSON data: ", geojsonData);
  }, [fetchGeojson]);

  const handleViewportChange = (newViewport) => {
    setViewport(newViewport);  // Only update viewport without fetching data
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

  const columnKeyMap = {
    'Place': 'place',
    'Magnitude': 'magnitude',
    'Magnitude Type': 'magnitude_type',
    'Longitude': 'coordinates[0]',
    'Latitude': 'coordinates[1]',
    'Depth': 'depth',
    'Origin Time (UTC)': 'utc_time',
  };

  const onSort = (header) => {
    const columnKey = columnKeyMap[header];
    if (!columnKey) return; // Exit if the column key is invalid
  
    let direction = 'ascending';
    if (sortConfig.key === columnKey && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!geojsonData || !geojsonData.features) return [];
  
    let sortableData = [...geojsonData.features];
    if (sortConfig.key) {
      const { key, direction } = sortConfig;
  
      sortableData.sort((a, b) => {
        const aValue = key.includes('coordinates') 
          ? a.geometry.coordinates[parseInt(key.split('[')[1][0])] // Extract longitude/latitude index
          : a.properties[key];
        const bValue = key.includes('coordinates') 
          ? b.geometry.coordinates[parseInt(key.split('[')[1][0])] 
          : b.properties[key];
  
        // Handle undefined/null values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return direction === 'ascending' ? 1 : -1;
        if (bValue == null) return direction === 'ascending' ? -1 : 1;
  
        // Normalize values for comparison
        const normalizedA = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
        const normalizedB = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
  
        // Compare values
        if (normalizedA < normalizedB) return direction === 'ascending' ? -1 : 1;
        if (normalizedA > normalizedB) return direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
  
    return sortableData.slice(startIndex, endIndex);
  }, [geojsonData, sortConfig, startIndex, endIndex]);
  

  

  const getMarkerSize = (magnitude) => {
    if (magnitude < -1.0) return 15;  // Temporary larger marker for easier hover
    if (magnitude < 0.0) return 20;
    if (magnitude < 1.0) return 25;
    if (magnitude < 2.0) return 30;
    if (magnitude < 3.0) return 35;
    if (magnitude < 4.0) return 40;
    if (magnitude < 5.0) return 45;
    if (magnitude < 6.0) return 50;
    if (magnitude < 7.0) return 55;
    if (magnitude < 8.0) return 60;
    return 70;
  };

  return (
    <div className="app-container">
      <nav className='navbar navbar-dark navbar-custom'>
        <div className='container-fluid'>
          <a className='navbar-brand' href="/home">
            <img src={logo} alt="Logo" />
            Earthquakes near me
          </a>
        </div>
      </nav>

      <div className='container'>
        <div className="d-flex align-items-center my-3">
          <button className='btn btn-primary button custom mx-3' onClick={fetchUserLocation}>
            Use my location
          </button>
        </div>

        <div className='map-container'>
          <ReactMapGL
            {...viewport}
            width="80%"
            height="100%"
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            onMove={(evt) => handleViewportChange(evt.viewState)} // Update viewport only
            mapStyle="mapbox://styles/mapbox/dark-v11"
            scrollZoom={true}
            doubleClickZoom={true}
            dragPan={true}
            dragRotate={true}
            interactive={true}
          >
            {geojsonData && geojsonData.features.map((feature, index) => (
              feature.geometry && feature.geometry.coordinates && (
                <Marker
                  key={index}
                  latitude={feature.geometry.coordinates[1]}
                  longitude={feature.geometry.coordinates[0]}
                  anchor="bottom"
                  >
                  <div
                    className="map-marker"
                    onMouseEnter={() => {
                      setHoverInfo(feature);
                      console.log("Hovering over:", feature);  // Log hover event
                    }}
                    onMouseLeave={() => {
                      setHoverInfo(null);
                      console.log("Hover ended");  // Log hover end
                    }}
                    style={{
                      pointerEvents: 'auto',
                      width: `${getMarkerSize(feature.properties.magnitude)}px`,
                      height: `${getMarkerSize(feature.properties.magnitude)}px`,
                      backgroundImage: `url('./earthquake.png')`,
                      backgroundSize: 'cover',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      zIndex: 1000
                    }}
                  ></div>
                </Marker>
              )
            ))}

          
            {hoverInfo && (
              <Popup
                longitude={hoverInfo.geometry.coordinates[0]}
                latitude={hoverInfo.geometry.coordinates[1]}
                closeButton={false}
                closeOnClick={false}
                anchor="top"
              >
                <div className='hover-popup'>
                  <strong>{hoverInfo.properties.place}</strong><br />
                  <div>Magnitude: {hoverInfo.properties.magnitude.toFixed(1)}</div>
                  <div>Depth: {hoverInfo.geometry.depth.toFixed(1)} km</div>
                </div>
              </Popup>
            )}
          

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
            {Object.keys(columnKeyMap).map((header, index) => (
                <th key={index}>
                  <div className="header-container">
                    <span>{header}</span>
                    <button onClick={() => onSort(header)} className="sort-button">
                    {sortConfig.key === columnKeyMap[header]
                        ? (sortConfig.direction === 'ascending'
                          ? <FontAwesomeIcon icon={faSortUp} />
                          : <FontAwesomeIcon icon={faSortDown} />)
                        : <FontAwesomeIcon icon={faSort} />}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((feature, index) => (
              <tr key={index}>
                <td>{feature.properties.place}</td>
                <td>{feature.properties.magnitude.toFixed(2)}</td>
                <td>{feature.properties.magnitude_type}</td>
                <td>{feature.geometry.coordinates[0].toFixed(2)}</td>
                <td>{feature.geometry.coordinates[1].toFixed(2)}</td>
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
