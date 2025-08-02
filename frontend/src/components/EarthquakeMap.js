import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { bbox } from '@turf/turf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs, faSearch, faSpinner, faLayerGroup, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons';
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
  const [hoverInfo, setHoverInfo] = useState(null);
  const [geojsonFetched, setGeojsonFetched] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentMapStyle, setCurrentMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showTectonicPlates, setShowTectonicPlates] = useState(false);

  const mapRef = useRef(null);

  // Available map styles
  const mapStyles = [
    { 
      id: 'streets', 
      name: 'Streets', 
      style: 'mapbox://styles/mapbox/streets-v12',
      description: 'Default street map'
    },
    { 
      id: 'satellite-streets', 
      name: 'Satellite Streets', 
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      description: 'Satellite with street labels'
    },
    { 
      id: 'light', 
      name: 'Light', 
      style: 'mapbox://styles/mapbox/light-v11',
      description: 'Light theme'
    },
    { 
      id: 'dark', 
      name: 'Dark', 
      style: 'mapbox://styles/mapbox/dark-v11',
      description: 'Dark theme'
    },
    { 
      id: 'outdoors', 
      name: 'Outdoors', 
      style: 'mapbox://styles/mapbox/outdoors-v12',
      description: 'Outdoor/terrain style'
    },
    { 
      id: 'monochrome', 
      name: 'Monochrome', 
      style: 'mapbox://styles/nvinard/cm3t2gjki004l01sif7mpdb4p',
      description: 'Custom monochrome style'
    }
  ];

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

  // Debounced search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSearchSuggestions(searchInput);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchInput]);


  const handleViewportChange = (newViewport) => {
    setViewport(newViewport);
  };

  const fetchSearchSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query.trim())}&limit=5&addressdetails=1`);
      const data = await response.json();
      setSearchSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    const { lat, lon, display_name } = location;
    setViewport({
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      zoom: 10,
      transitionDuration: 1000,
    });
    setSelectedLocation({ 
      latitude: parseFloat(lat), 
      longitude: parseFloat(lon),
      name: display_name 
    });
    setSearchInput('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  const searchLocation = async () => {
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput.trim())}&limit=1`);
      const data = await response.json();
      
      if (data.length > 0) {
        selectLocation(data[0]);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
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
          setIsLocating(false);
        },
        (error) => {
          console.error('Error fetching user location:', error);
          alert('Unable to get your location. Please ensure location services are enabled.');
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };

  const handleStyleChange = (newStyle) => {
    setCurrentMapStyle(newStyle);
    setShowStyleSelector(false);
  };

  const toggleStyleSelector = () => {
    setShowStyleSelector(!showStyleSelector);
  };

  const getCurrentStyleName = () => {
    const currentStyle = mapStyles.find(style => style.style === currentMapStyle);
    return currentStyle ? currentStyle.name : 'Streets';
  };

  const toggleTectonicPlates = () => {
    setShowTectonicPlates(!showTectonicPlates);
  };

  // Add tectonic plates layer when map loads and toggle state changes
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      
      const addTectonicPlatesLayer = () => {
        // Check if source already exists
        if (!map.getSource('tectonic-plates')) {
          map.addSource('tectonic-plates', {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'
          });
        }

        // Check if layer already exists
        if (!map.getLayer('tectonic-plates-layer')) {
          map.addLayer({
            id: 'tectonic-plates-layer',
            type: 'line',
            source: 'tectonic-plates',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#ff6b6b',
              'line-width': 2,
              'line-opacity': 0.8
            }
          });
        }

        // Set initial visibility
        map.setLayoutProperty('tectonic-plates-layer', 'visibility', showTectonicPlates ? 'visible' : 'none');
      };

      // Wait for map to load before adding layer
      if (map.isStyleLoaded()) {
        addTectonicPlatesLayer();
      } else {
        map.on('style.load', addTectonicPlatesLayer);
      }

      // Update layer visibility when toggle changes
      if (map.getLayer('tectonic-plates-layer')) {
        map.setLayoutProperty('tectonic-plates-layer', 'visibility', showTectonicPlates ? 'visible' : 'none');
      }
    }
  }, [showTectonicPlates, currentMapStyle]); // Re-run when map style changes too

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
      <div className="map-container">
        <div className="map-wrapper">
          {/* Floating Location Controls */}
          <div className="location-controls">
            <div className="search-container">
              <input
                type="text"
                className="location-search-input"
                placeholder="Search location..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                onFocus={() => setShowSuggestions(searchSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                disabled={isSearching}
              />
              <button 
                className="search-button"
                onClick={searchLocation}
                disabled={isSearching || !searchInput.trim()}
              >
                <FontAwesomeIcon icon={isSearching ? faSpinner : faSearch} spin={isSearching} />
              </button>
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="search-suggestions">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="search-suggestion"
                      onClick={() => selectLocation(suggestion)}
                    >
                      <div className="suggestion-name">{suggestion.display_name}</div>
                      <div className="suggestion-type">{suggestion.type || suggestion.class}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              className="location-button"
              onClick={fetchUserLocation}
              disabled={isLocating}
              title="Use my location"
            >
              <FontAwesomeIcon icon={isLocating ? faSpinner : faLocationCrosshairs} spin={isLocating} />
            </button>
            
            <button 
              className={`tectonic-button ${showTectonicPlates ? 'active' : ''}`}
              onClick={toggleTectonicPlates}
              title="Toggle tectonic plate boundaries"
            >
              <FontAwesomeIcon icon={faGlobeAmericas} />
            </button>
          </div>

          <ReactMapGL
            ref={mapRef}
            {...viewport}
            width="100%"
            height="70vh"
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            onMove={(evt) => handleViewportChange(evt.viewState)}
            mapStyle={currentMapStyle}
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
                    pointerEvents: 'auto',
                    width: `${getMarkerSize(feature.properties.magnitude)}px`,
                    height: `${getMarkerSize(feature.properties.magnitude)}px`,
                    backgroundImage: `url('./earthquake.png')`,
                    backgroundSize: 'cover',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    zIndex: 1000,
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
              <div className="hover-popup">
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

          {selectedLocation && (
            <Marker latitude={selectedLocation.latitude} longitude={selectedLocation.longitude}>
              <div style={{ fontSize: '30px', transform: 'translate(-50%, -100%)' }}>📍</div>
            </Marker>
          )}

          {/* Map Style Selector */}
          <div className="map-style-selector">
            <button 
              className="style-selector-button"
              onClick={toggleStyleSelector}
              title="Change map style"
            >
              <FontAwesomeIcon icon={faLayerGroup} />
              <span className="style-name">{getCurrentStyleName()}</span>
            </button>
            
            {showStyleSelector && (
              <div className="style-dropdown">
                {mapStyles.map((style) => (
                  <button
                    key={style.id}
                    className={`style-option ${currentMapStyle === style.style ? 'active' : ''}`}
                    onClick={() => handleStyleChange(style.style)}
                  >
                    <div className="style-info">
                      <span className="style-name">{style.name}</span>
                      <span className="style-description">{style.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', right: 10, top: 10 }}>
            <NavigationControl />
          </div>
        </ReactMapGL>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeMap;
