import React, { useState, useEffect, useCallback } from 'react';
import EarthquakeMap from '../components/EarthquakeMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const itemsPerPage = 20;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const fetchGeojson = useCallback(async () => {
    try {
      const url = `${window.REACT_APP_API_URL}/api/earthquakes.geojson?v=` + new Date().getTime();
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

  const sortedData = React.useMemo(() => {
    if (!geojsonData || !geojsonData.features) return [];

    let sortableData = [...geojsonData.features];
    if (sortConfig.key) {
      const { key, direction } = sortConfig;

      sortableData.sort((a, b) => {
        const aValue = a.properties[key];
        const bValue = b.properties[key];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return direction === 'ascending' ? 1 : -1;
        if (bValue == null) return direction === 'ascending' ? -1 : 1;

        return direction === 'ascending' ? aValue - bValue : bValue - aValue;
      });
    }

    return sortableData.slice(startIndex, endIndex);
  }, [geojsonData, sortConfig, startIndex, endIndex]);

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


  return (
    <div>
      {/* Earthquake Map */}
      <EarthquakeMap />

      {/* Earthquake Table */}
      <div className="table-container">
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
            disabled={!geojsonData || currentPage >= Math.ceil(geojsonData.features.length / itemsPerPage) - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
