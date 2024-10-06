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

  const [isViewportSet, setIsViewportSet] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = geojsonData ? geojsonData.features.slice(startIndex, endIndex) : [];

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const fetchGeojson = useCallback(async () => {
    try {
      const response = await fetch('earthquakes.geojson');
      const data = await response.json();
      setGeojsonData(data);

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
  }, [isViewportSet, viewport]);

  useEffect(() => {
    fetchGeojson();
  }, [fetchGeojson]);

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
            latitude: latitude,
            longitude: longitude,
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

  const onSort = (columnKey) => {
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
    return 70;
  };

  return (
    <div className="app-container">
      <nav className='navbar navbar-dark navbar-custom'>
        <div className='container-fluid'>
          <a className='navbar-brand' href="/home">
            <img src={logo} alt="Logo" />
            Earthquakes near you
          </a>
        </div>
      </nav>

      <div className='container'>
        <div className="d-flex align-items-center my-3">
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
                    style={{
                      width: `${getMarkerSize(feature.properties.magnitude)}px`,
                      height: `${getMarkerSize(feature.properties.magnitude)}px`,
                      backgroundImage: `url('./earthquake.png')`,
                      backgroundSize: 'cover',
                      borderRadius: '50%',
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
              {['Place', 'Magnitude', 'Magnitude Type', 'Longitude', 'Latitude', 'Depth', 'Origin Time (UTC)'].map((header, index) => (
                <th key={index}>
                  <div className="header-container">
                    <span>{header}</span>
                    <button onClick={() => onSort(header.toLowerCase().replace(' ', '_'))} className="sort-button">
                      {sortConfig.key === header.toLowerCase().replace(' ', '_')
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