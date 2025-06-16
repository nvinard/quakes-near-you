import React from 'react';

const Data = () => {
  return (
    <div className="page-container">
      <h1>Data Information</h1>
      <p>
        The earthquake data displayed in this application is sourced from United States Geological Survey, USGS, and European-Mediterranean Seismological Survey EMSC APIs.
      </p>
      <p>
        The data includes information about recent earthquakes worldwide, including magnitude, depth, location, and time.
      </p>

      <h2>Magnitude Types Explained</h2>
      <p>
        Earthquake magnitudes can be reported using different scales. Below are explanations for the most commonly used magnitude types:
      </p>
      <ul>
        <li>
          <strong>ML (Local Magnitude):</strong> Also known as the Richter scale, ML is based on the maximum amplitude of seismic waves recorded by a seismograph. It is mostly used for smaller earthquakes and local events.
        </li>
        <li>
          <strong>Mw (Moment Magnitude):</strong> This is a modern and widely used scale that measures the total energy released by an earthquake. Mw is considered more accurate for large earthquakes and provides a consistent measure across all sizes.
        </li>
        <li>
          <strong>Md (Duration Magnitude):</strong> This scale is based on the duration of seismic waves and is often used for small or regional earthquakes where other methods might not be reliable.
        </li>
      </ul>

    </div>
  );
};

export default Data;
