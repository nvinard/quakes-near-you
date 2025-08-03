import React, { useEffect } from 'react';

const Data = () => {
  useEffect(() => {
    document.title = 'Earthquake Data & API - Real-Time Seismic Information | Earthquakes Near Me';
    document.querySelector('meta[name="description"]').setAttribute('content', 
      'Access comprehensive earthquake data from USGS and EMSC APIs. Learn about magnitude scales, seismic monitoring, and real-time earthquake information sources.');
  }, []);

  return (
    <div className="page-container">
      <h1>Earthquake Data Sources & Information</h1>
      
      <section>
        <h2>Data Sources</h2>
        <p>
          Our real-time earthquake tracking system aggregates data from two authoritative seismological organizations to provide comprehensive global earthquake coverage:
        </p>
        
        <h3>United States Geological Survey (USGS)</h3>
        <ul>
          <li><strong>Coverage:</strong> Global earthquake monitoring with emphasis on United States seismic activity</li>
          <li><strong>Update Frequency:</strong> Real-time data updates as earthquakes are detected and analyzed</li>
          <li><strong>API Endpoint:</strong> USGS Earthquake API providing GeoJSON formatted data</li>
          <li><strong>Data Quality:</strong> Reviewed and verified by professional seismologists</li>
        </ul>

        <h3>European-Mediterranean Seismological Centre (EMSC)</h3>
        <ul>
          <li><strong>Coverage:</strong> European, Mediterranean, and global seismic monitoring</li>
          <li><strong>Network:</strong> Data from over 70 member seismological institutes</li>
          <li><strong>Specialization:</strong> Enhanced coverage for European and Mediterranean regions</li>
          <li><strong>Real-time Processing:</strong> Automatic earthquake detection and rapid reporting</li>
        </ul>
      </section>

      <section>
        <h2>Data Accuracy & Reliability</h2>
        <p>
          All earthquake data is automatically refreshed every 10 minutes to ensure you have access to the most recent seismic activity. Our system normalizes data from both sources into a consistent format providing:
        </p>
        <ul>
          <li><strong>Precise Coordinates:</strong> Latitude and longitude of earthquake epicenters</li>
          <li><strong>Magnitude Measurements:</strong> Various magnitude scales (ML, Mw, Md) as appropriate</li>
          <li><strong>Depth Information:</strong> Earthquake depth below Earth's surface in kilometers</li>
          <li><strong>Timestamp Data:</strong> Exact time of earthquake occurrence in UTC</li>
          <li><strong>Location Descriptions:</strong> Human-readable location names and geographic references</li>
        </ul>
      </section>

      <section>
        <h2>Earthquake Magnitude Scales</h2>
        <p>
          Understanding earthquake magnitude is crucial for assessing seismic risk and impact. Different magnitude scales are used depending on earthquake size and seismographic conditions:
        </p>
        
        <h3>ML (Local Magnitude / Richter Scale)</h3>
        <ul>
          <li><strong>Range:</strong> Typically 0-6, though can extend higher</li>
          <li><strong>Best For:</strong> Small to moderate local earthquakes</li>
          <li><strong>Measurement:</strong> Based on maximum amplitude of seismic waves</li>
          <li><strong>Limitations:</strong> Saturates for large earthquakes (magnitude 6+)</li>
        </ul>

        <h3>Mw (Moment Magnitude Scale)</h3>
        <ul>
          <li><strong>Range:</strong> No upper limit, can measure earthquakes of any size</li>
          <li><strong>Best For:</strong> Large earthquakes and global standardization</li>
          <li><strong>Measurement:</strong> Based on total energy released by the earthquake</li>
          <li><strong>Advantages:</strong> Most accurate for large earthquakes, doesn't saturate</li>
        </ul>

        <h3>Md (Duration Magnitude)</h3>
        <ul>
          <li><strong>Range:</strong> Typically used for smaller regional earthquakes</li>
          <li><strong>Best For:</strong> Areas with limited seismographic coverage</li>
          <li><strong>Measurement:</strong> Based on duration of seismic wave recording</li>
          <li><strong>Usage:</strong> Often used when other magnitude types cannot be determined</li>
        </ul>
      </section>

      <section>
        <h2>Earthquake Intensity vs. Magnitude</h2>
        <p>
          It's important to distinguish between earthquake magnitude and intensity:
        </p>
        <ul>
          <li><strong>Magnitude:</strong> Measures the energy released at the earthquake source (what we display)</li>
          <li><strong>Intensity:</strong> Measures the effects and damage at specific locations</li>
          <li><strong>Modified Mercalli Intensity (MMI):</strong> Scale I-XII describing earthquake effects</li>
          <li><strong>Relationship:</strong> One earthquake has one magnitude but many intensity values</li>
        </ul>
      </section>

      <section>
        <h2>API Access for Developers</h2>
        <p>
          Developers can access our earthquake data through our public API endpoint:
        </p>
        <code>https://quakesnearme.com/api/earthquakes.geojson</code>
        
        <h3>API Features:</h3>
        <ul>
          <li><strong>Format:</strong> GeoJSON standard format for easy integration</li>
          <li><strong>Updates:</strong> Data refreshed every 10 minutes</li>
          <li><strong>CORS Enabled:</strong> Cross-origin requests supported for web applications</li>
          <li><strong>No Authentication:</strong> Free public access to earthquake data</li>
        </ul>

        <h3>Example Response Structure:</h3>
        <pre>
{`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude, depth]
      },
      "properties": {
        "magnitude": 4.2,
        "place": "10km SW of San Francisco, CA",
        "time": "2025-08-03T12:30:45.000Z",
        "depth": 8.5
      }
    }
  ]
}`}
        </pre>
      </section>

      <section>
        <h2>Understanding Seismic Risk</h2>
        <p>
          Earthquake magnitude relates to potential impact as follows:
        </p>
        <ul>
          <li><strong>0-2.9:</strong> Micro earthquakes, usually not felt</li>
          <li><strong>3.0-3.9:</strong> Minor earthquakes, often felt but rarely cause damage</li>
          <li><strong>4.0-4.9:</strong> Light earthquakes, noticeable shaking, minimal damage</li>
          <li><strong>5.0-5.9:</strong> Moderate earthquakes, can cause damage to poorly constructed buildings</li>
          <li><strong>6.0-6.9:</strong> Strong earthquakes, destructive in populated areas</li>
          <li><strong>7.0-7.9:</strong> Major earthquakes, serious damage over large areas</li>
          <li><strong>8.0+:</strong> Great earthquakes, can totally destroy communities</li>
        </ul>
      </section>

      <section>
        <h2>Data Limitations & Disclaimers</h2>
        <ul>
          <li>Earthquake data is provided for informational purposes only</li>
          <li>For emergency situations, always rely on official emergency services</li>
          <li>Magnitude and location data may be revised as more information becomes available</li>
          <li>Small earthquakes (below magnitude 2.5) may not be detected by all monitoring networks</li>
          <li>This application is not a substitute for official earthquake warning systems</li>
        </ul>
      </section>
    </div>
  );
};

export default Data;
