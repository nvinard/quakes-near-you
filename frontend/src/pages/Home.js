import React, { useState, useEffect, useCallback } from 'react';
import EarthquakeMap from '../components/EarthquakeMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showTable, setShowTable] = useState(false);
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

  // Sort the entire dataset before pagination
  const sortedData = React.useMemo(() => {
    if (!geojsonData || !geojsonData.features) return [];

    let sortableData = [...geojsonData.features];
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
  }, [geojsonData, sortConfig]);

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
    <div>
      {/* Earthquake Map */}
      <EarthquakeMap />

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

      {/* Toggle Button for Earthquake Table - Moved to Bottom */}
      <div className="table-toggle-section bottom-toggle">
        <button 
          className="toggle-table-btn"
          onClick={() => setShowTable(!showTable)}
        >
          <FontAwesomeIcon icon={showTable ? faChevronUp : faChevronDown} />
          {showTable ? 'Hide' : 'Show'} Earthquake Data 
          {geojsonData && ` (${sortedData.length} records)`}
        </button>
      </div>
    </div>
  );
};

export default Home;
