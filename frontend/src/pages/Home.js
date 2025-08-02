import React, { useState, useEffect, useCallback } from 'react';
import EarthquakeMap from '../components/EarthquakeMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faChevronDown, faChevronUp, faFilter, faSliders } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showTable, setShowTable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    magnitude: { min: 0, max: 10 },
    distance: { max: 1000, enabled: false }, // km from user location
    depth: { min: 0, max: 1000 } // km
  });
  const itemsPerPage = 20;

  const fetchGeojson = useCallback(async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/earthquakes.geojson?v=` + new Date().getTime();
      const response = await fetch(url);
      const data = await response.json();
      setGeojsonData(data);
    } catch (error) {
      alert('Failed to load earthquake data. Please try again later.');
    }
  }, []);

  useEffect(() => {
    fetchGeojson();
  }, [fetchGeojson]);

  // Utility to safely access nested properties
  const getNestedValue = (obj, path) => {
    try {
      return path.split('.').reduce((acc, key) => {
        if (key.includes('[')) {
          const [base, index] = key.replace(']', '').split('[');
          return acc[base] ? acc[base][parseInt(index, 10)] : undefined;
        }
        return acc[key];
      }, obj);
    } catch {
      return undefined;
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Filter earthquakes based on current filter settings
  const filterEarthquakes = (features) => {
    if (!features) return [];
    
    return features.filter(feature => {
      const magnitude = feature.properties.magnitude;
      const depth = Math.abs(feature.geometry.coordinates[2]); // Depth is usually negative
      const lat = feature.geometry.coordinates[1];
      const lon = feature.geometry.coordinates[0];
      
      // Magnitude filter
      if (magnitude < filters.magnitude.min || magnitude > filters.magnitude.max) {
        return false;
      }
      
      // Depth filter
      if (depth < filters.depth.min || depth > filters.depth.max) {
        return false;
      }
      
      // Distance filter (only if enabled and user location is available)
      if (filters.distance.enabled && userLocation) {
        const distance = calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          lat, 
          lon
        );
        if (distance > filters.distance.max) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Filter and sort the dataset before pagination
  const sortedData = React.useMemo(() => {
    if (!geojsonData || !geojsonData.features) return [];

    // First apply filters
    let sortableData = filterEarthquakes(geojsonData.features);
    if (sortConfig.key) {
      const { key, direction } = sortConfig;

      sortableData.sort((a, b) => {
        const aValue = getNestedValue(a, key);
        const bValue = getNestedValue(b, key);

        // Handle null or undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return direction === 'ascending' ? 1 : -1;
        if (bValue == null) return direction === 'ascending' ? -1 : 1;

        // Numeric comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }

        // String comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0; // Default to equality
      });
    }

    return sortableData;
  }, [geojsonData, sortConfig, filters, userLocation]);

  // Paginate sorted data
  const paginatedData = React.useMemo(() => {
    return sortedData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const nextPage = () => {
    if (geojsonData && currentPage < Math.ceil(sortedData.length / itemsPerPage) - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const columnKeyMap = {
    'Place': 'properties.place',
    'Magnitude': 'properties.magnitude',
    'Magnitude Type': 'properties.magnitude_type',
    'Longitude': 'geometry.coordinates[0]',
    'Latitude': 'geometry.coordinates[1]',
    'Depth': 'geometry.coordinates[2]',
    'Origin Time (UTC)': 'properties.utc_time',
  };

  const onSort = (header) => {
    const columnKey = columnKeyMap[header];
    if (!columnKey) return;

    let direction = 'ascending';
    if (sortConfig.key === columnKey && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: columnKey, direction });
  };

  return (
    <div className="home-page">
      {/* Earthquake Map */}
      <div className="map-section">
        <EarthquakeMap 
          filteredData={sortedData} 
          onLocationUpdate={setUserLocation}
        />
      </div>

      {/* Control Buttons Section */}
      <div className="control-buttons-section">
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FontAwesomeIcon icon={faSliders} />
          Filters
          <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} />
        </button>
        
        <button 
          className="toggle-table-btn"
          onClick={() => setShowTable(!showTable)}
        >
          <FontAwesomeIcon icon={showTable ? faChevronUp : faChevronDown} />
          {showTable ? 'Hide' : 'Show'} Earthquake Data 
          {geojsonData && ` (${sortedData.length} records)`}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            {/* Magnitude Filter */}
            <div className="filter-group">
              <label className="filter-label">Magnitude Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.magnitude.min}
                  onChange={(e) => setFilters({
                    ...filters,
                    magnitude: { ...filters.magnitude, min: parseFloat(e.target.value) || 0 }
                  })}
                  className="range-input"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.magnitude.max}
                  onChange={(e) => setFilters({
                    ...filters,
                    magnitude: { ...filters.magnitude, max: parseFloat(e.target.value) || 10 }
                  })}
                  className="range-input"
                />
              </div>
            </div>

            {/* Depth Filter */}
            <div className="filter-group">
              <label className="filter-label">Depth Range (km)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={filters.depth.min}
                  onChange={(e) => setFilters({
                    ...filters,
                    depth: { ...filters.depth, min: parseFloat(e.target.value) || 0 }
                  })}
                  className="range-input"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={filters.depth.max}
                  onChange={(e) => setFilters({
                    ...filters,
                    depth: { ...filters.depth, max: parseFloat(e.target.value) || 1000 }
                  })}
                  className="range-input"
                />
              </div>
            </div>

            {/* Distance Filter */}
            <div className="filter-group">
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={filters.distance.enabled}
                  onChange={(e) => setFilters({
                    ...filters,
                    distance: { ...filters.distance, enabled: e.target.checked }
                  })}
                  className="filter-checkbox"
                />
                Distance from Location (km)
              </label>
              <div className="range-inputs">
                <span className="range-label">Within</span>
                <input
                  type="number"
                  min="1"
                  max="20000"
                  step="10"
                  value={filters.distance.max}
                  onChange={(e) => setFilters({
                    ...filters,
                    distance: { ...filters.distance, max: parseFloat(e.target.value) || 1000 }
                  })}
                  className="range-input"
                  disabled={!filters.distance.enabled}
                />
                <span className="range-label">km</span>
              </div>
              {filters.distance.enabled && !userLocation && (
                <div className="filter-warning">
                  📍 Use location search or GPS to enable distance filtering
                </div>
              )}
            </div>
          </div>
          
          <div className="filter-actions">
            <button 
              className="reset-filters-btn"
              onClick={() => setFilters({
                magnitude: { min: 0, max: 10 },
                distance: { max: 1000, enabled: false },
                depth: { min: 0, max: 1000 }
              })}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Earthquake Table */}
      <div className={`table-container ${showTable ? 'expanded' : 'collapsed'}`}>
        {showTable && (
          <>
            <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              {Object.keys(columnKeyMap).map((header, index) => (
                <th key={index}>
                  <div className="header-container">
                    <span>{header}</span>
                    <button onClick={() => onSort(header)} className="sort-button">
                      {sortConfig.key === columnKeyMap[header]
                        ? sortConfig.direction === 'ascending'
                          ? <FontAwesomeIcon icon={faSortUp} />
                          : <FontAwesomeIcon icon={faSortDown} />
                        : <FontAwesomeIcon icon={faSort} />}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((feature, index) => (
              <tr key={index}>
                <td>{feature.properties.place}</td>
                <td>{feature.properties.magnitude.toFixed(2)}</td>
                <td>{feature.properties.magnitude_type}</td>
                <td>{feature.geometry.coordinates[0].toFixed(2)}</td>
                <td>{feature.geometry.coordinates[1].toFixed(2)}</td>
                <td>{feature.geometry.coordinates[2].toFixed(2)}</td>
                <td>{feature.properties.utc_time}</td>
              </tr>
            ))}
          </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination-controls">
              <button onClick={previousPage} disabled={currentPage === 0}>
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={!geojsonData || currentPage >= Math.ceil(sortedData.length / itemsPerPage) - 1}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
