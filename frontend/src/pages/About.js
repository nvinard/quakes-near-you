import React, { useEffect } from 'react';

const About = () => {
  useEffect(() => {
    document.title = 'About - Earthquakes Near Me | Real-Time Seismic Monitoring';
    document.querySelector('meta[name="description"]').setAttribute('content', 
      'Learn about Quakes Near Me - a real-time earthquake tracking application providing live seismic data from USGS and EMSC. Track earthquake magnitude, depth, and location worldwide.');
  }, []);

  return (
    <div className="page-container">
      <h1>About Earthquakes Near Me</h1>
      
      <section>
        <h2>Real-Time Earthquake Monitoring</h2>
        <p>
          Earthquakes Near Me is a comprehensive real-time earthquake tracking platform that provides up-to-date seismic information from authoritative sources including the <strong>United States Geological Survey (USGS)</strong> and the <strong>European-Mediterranean Seismological Centre (EMSC)</strong>.
        </p>
      </section>

      <section>
        <h2>Features</h2>
        <ul>
          <li><strong>Interactive Map:</strong> Explore recent earthquakes on an interactive map with customizable styles</li>
          <li><strong>Location-Based Filtering:</strong> Find earthquakes near your current location or search for specific areas</li>
          <li><strong>Advanced Filters:</strong> Filter by magnitude (0-10), depth (0-1000km), and distance from your location</li>
          <li><strong>Tectonic Plate Overlay:</strong> Visualize earthquake activity in relation to tectonic plate boundaries</li>
          <li><strong>Data Table:</strong> Sort and analyze earthquake data including magnitude, depth, time, and location</li>
          <li><strong>Mobile Responsive:</strong> Access earthquake information on any device</li>
        </ul>
      </section>

      <section>
        <h2>Data Sources & Accuracy</h2>
        <p>
          Our earthquake data is sourced from two premier seismological organizations:
        </p>
        <ul>
          <li><strong>USGS (United States Geological Survey):</strong> Provides comprehensive earthquake data for the United States and global seismic events</li>
          <li><strong>EMSC (European-Mediterranean Seismological Centre):</strong> Offers detailed seismic monitoring for European and Mediterranean regions</li>
        </ul>
        <p>
          Data is automatically updated every 10 minutes to ensure you have access to the most recent seismic activity. All earthquake information includes precise coordinates, magnitude measurements, depth calculations, and timestamp data.
        </p>
      </section>

      <section>
        <h2>Understanding Earthquake Data</h2>
        <ul>
          <li><strong>Magnitude:</strong> Measures earthquake strength on the Richter scale (typically 0-10)</li>
          <li><strong>Depth:</strong> Distance below Earth's surface where the earthquake originated (measured in kilometers)</li>
          <li><strong>Location:</strong> Geographic coordinates and descriptive location of the earthquake epicenter</li>
          <li><strong>Time:</strong> Precise timestamp of when the earthquake occurred (UTC)</li>
        </ul>
      </section>

      <section>
        <h2>Safety & Emergency Information</h2>
        <p>
          This application is designed for informational purposes and earthquake awareness. For emergency situations:
        </p>
        <ul>
          <li>Contact local emergency services immediately (911 in the US)</li>
          <li>Follow official earthquake safety guidelines from your local emergency management agency</li>
          <li>Visit <a href="https://earthquake.usgs.gov" target="_blank" rel="noopener noreferrer">USGS Earthquake Hazards Program</a> for official earthquake information</li>
          <li>Stay informed through official government emergency alerts and warnings</li>
        </ul>
      </section>

      <section>
        <h2>Future Enhancements</h2>
        <p>Planned features and improvements include:</p>
        <ul>
          <li>Historical earthquake data with customizable time ranges</li>
          <li>Earthquake prediction models and risk assessment tools</li>
          <li>Push notifications for significant seismic events</li>
          <li>Integration with additional global seismological networks</li>
          <li>Detailed geological information and educational resources</li>
        </ul>
      </section>

      <section>
        <h2>Technical Information</h2>
        <p>
          <strong>Created by:</strong> Nicolas Vinard<br/>
          <strong>Version:</strong> 2.0.0<br/>
          <strong>Last Updated:</strong> August 2025
        </p>
        <p>
          Built with React, Mapbox GL JS, and FastAPI. Data processing utilizes SQLAlchemy with PostgreSQL for reliable data storage and retrieval.
        </p>
      </section>
    </div>
  );
};

export default About;
