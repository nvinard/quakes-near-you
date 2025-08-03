import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const locationData = {
  'california': {
    name: 'California',
    description: 'California sits on the Pacific Ring of Fire and is one of the most seismically active regions in the United States. Major fault systems including the San Andreas Fault create frequent earthquake activity.',
    majorFaults: ['San Andreas Fault', 'Hayward Fault', 'Calaveras Fault', 'San Jacinto Fault'],
    riskLevel: 'Very High',
    recentActivity: 'California experiences thousands of earthquakes annually, with most being minor tremors.',
    preparedness: [
      'Keep emergency kits readily available',
      'Secure heavy furniture and appliances',
      'Practice Drop, Cover, and Hold On',
      'Know your evacuation routes'
    ]
  },
  'japan': {
    name: 'Japan',
    description: 'Japan is located at the junction of four tectonic plates, making it one of the most earthquake-prone countries in the world. The country experiences about 1,500 earthquakes annually.',
    majorFaults: ['Japan Trench', 'Nankai Trough', 'Sagami Trough'],
    riskLevel: 'Extreme',
    recentActivity: 'Japan regularly experiences significant seismic activity including the devastating 2011 Tōhoku earthquake.',
    preparedness: [
      'Advanced early warning systems',
      'Earthquake-resistant building codes',
      'Regular evacuation drills',
      'Comprehensive disaster preparedness'
    ]
  },
  'turkey': {
    name: 'Turkey',
    description: 'Turkey sits at the intersection of the Eurasian and African tectonic plates, with the North Anatolian Fault being particularly active.',
    majorFaults: ['North Anatolian Fault', 'East Anatolian Fault'],
    riskLevel: 'High',
    recentActivity: 'Recent major earthquakes in 2023 caused significant damage and highlighted the ongoing seismic risk.',
    preparedness: [
      'Building code improvements',
      'Public education programs',
      'Emergency response training',
      'International cooperation for disaster relief'
    ]
  },
  'chile': {
    name: 'Chile',
    description: 'Chile lies along the Pacific Ring of Fire where the Nazca Plate subducts beneath the South American Plate, creating one of the most seismically active regions globally.',
    majorFaults: ['Peru-Chile Trench', 'Liquiñe-Ofqui Fault'],
    riskLevel: 'Very High',
    recentActivity: 'Chile has experienced some of the strongest earthquakes in recorded history, including the 1960 Valdivia earthquake (magnitude 9.5).',
    preparedness: [
      'Strict seismic building codes',
      'National earthquake preparedness programs',
      'Tsunami warning systems',
      'Community response networks'
    ]
  }
};

const Locations = () => {
  const { location } = useParams();
  const locationInfo = locationData[location?.toLowerCase()];

  useEffect(() => {
    if (locationInfo) {
      document.title = `Earthquakes in ${locationInfo.name} - Real-Time Seismic Activity | Earthquakes Near Me`;
      document.querySelector('meta[name="description"]').setAttribute('content', 
        `Track recent earthquakes in ${locationInfo.name}. ${locationInfo.description.substring(0, 120)}...`);
    } else {
      document.title = 'Location-Based Earthquake Information | Earthquakes Near Me';
      document.querySelector('meta[name="description"]').setAttribute('content', 
        'Explore earthquake activity by location. Get detailed seismic information for major earthquake-prone regions worldwide.');
    }
  }, [locationInfo]);

  if (!locationInfo) {
    return (
      <div className="page-container">
        <h1>Earthquake Information by Location</h1>
        <p>Explore earthquake activity and seismic information for major regions around the world.</p>
        
        <div className="location-grid">
          <div className="location-card">
            <h3><Link to="/locations/california">California, USA</Link></h3>
            <p>Pacific Ring of Fire • San Andreas Fault System • Very High Risk</p>
          </div>
          
          <div className="location-card">
            <h3><Link to="/locations/japan">Japan</Link></h3>
            <p>Four Tectonic Plates Junction • Extreme Seismic Activity</p>
          </div>
          
          <div className="location-card">
            <h3><Link to="/locations/turkey">Turkey</Link></h3>
            <p>North Anatolian Fault • Eurasian-African Plate Boundary</p>
          </div>
          
          <div className="location-card">
            <h3><Link to="/locations/chile">Chile</Link></h3>
            <p>Pacific Ring of Fire • Nazca Plate Subduction • Historical Major Quakes</p>
          </div>
        </div>

        <section>
          <h2>Understanding Regional Seismic Activity</h2>
          <p>
            Different regions around the world experience varying levels of earthquake activity based on their 
            geological setting, proximity to tectonic plate boundaries, and local fault systems. 
            Understanding regional seismic patterns helps in:
          </p>
          <ul>
            <li>Emergency preparedness planning</li>
            <li>Building code development</li>
            <li>Risk assessment for insurance and planning</li>
            <li>Scientific research and monitoring</li>
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Earthquakes in {locationInfo.name}</h1>
      
      <section>
        <h2>Seismic Overview</h2>
        <p>{locationInfo.description}</p>
        
        <div className="risk-indicator">
          <strong>Risk Level: </strong>
          <span className={`risk-${locationInfo.riskLevel.replace(' ', '-').toLowerCase()}`}>
            {locationInfo.riskLevel}
          </span>
        </div>
      </section>

      <section>
        <h2>Major Fault Systems</h2>
        <ul>
          {locationInfo.majorFaults.map((fault, index) => (
            <li key={index}><strong>{fault}</strong></li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Recent Seismic Activity</h2>
        <p>{locationInfo.recentActivity}</p>
      </section>

      <section>
        <h2>Earthquake Preparedness</h2>
        <ul>
          {locationInfo.preparedness.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Real-Time Earthquake Monitoring</h2>
        <p>
          Use our <Link to="/">interactive earthquake map</Link> to track current seismic activity in {locationInfo.name} and worldwide. 
          Our system provides real-time updates from USGS and EMSC monitoring networks.
        </p>
      </section>

      <nav className="location-nav">
        <Link to="/locations">&larr; Back to All Locations</Link>
        <Link to="/">View Live Earthquake Map</Link>
      </nav>
    </div>
  );
};

export default Locations;