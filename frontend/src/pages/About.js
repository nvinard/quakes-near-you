import React from 'react';

const About = () => {
  return (
    <div className="page-container">
      <h1>About</h1>
      <p>
        <strong>Created by:</strong> Nicolas Vinard
      </p>
      <p>
        <strong>Version:</strong> 1.0.0
      </p>
      <p>
        This application is designed to provide users with up-to-date information on recent earthquakes worldwide. Currently, the application displays only earthquakes from the last 24 hours. In future updates, I aim to:
      </p>
      <ul>
        <li>Introduce a time filter, allowing users to view earthquakes over a customizable timeframe.</li>
        <li>Incorporate data from additional sources for a more comprehensive dataset.</li>
      </ul>
    </div>
  );
};

export default About;
