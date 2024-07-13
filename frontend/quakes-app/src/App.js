import React, { useState, useEffect } from 'react';
import api from './api';
import './App.css';
import logo from './quakes_near_me.JPG';

const App = () => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [fetchMessage, setFetchMessage] = useState('');

  const fetchQuakes = async () => {
    const response = await api.get('/earthquakes/');
    setEarthquakes(response.data);
  };

  useEffect(() => {
    fetchQuakes();
  }, []);

  const handleFetchLatestData = async () => {
    try {
      const response = await api.post('/fetch_and_store_fdsn_earthquakes/');
      setFetchMessage(response.data.message);
      fetchQuakes();
    } catch (error) {
      console.error('Error fetching latest data:', error);
      setFetchMessage('Error fetching latest data');
    }
  };

  return (
    <div>
      <nav className='navbar navbar-dark navbar-custom'>
        <div className='container-fluid'>
          <a className='navbar-brand' href="#">
            <img src={logo} alt="Logo" />
            Earthquakes near me
          </a>
        </div>
      </nav>

      <div className='container'>
        <div className="d-flex align-items-center my-3">
          <button className='btn btn-primary button-custom' onClick={handleFetchLatestData}>
            Get latest data from FDSN
          </button>
          <span className='mx-3'>{fetchMessage}</span>
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
            {earthquakes.map((earthquake) => (
              <tr key={earthquake.id}>
                <td>{earthquake.magnitude}</td>
                <td>{earthquake.magnitude_type}</td>
                <td>{earthquake.longitude}</td>
                <td>{earthquake.latitude}</td>
                <td>{earthquake.depth}</td>
                <td>{earthquake.place}</td>
                <td>{earthquake.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;