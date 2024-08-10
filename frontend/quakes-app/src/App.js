import React, { useState, useEffect } from 'react';
import api from './api';
import './App.css';
import logo from './quakes_near_me.JPG';
import ReactMapGL, { Marker } from 'react-map-gl';

const App = () => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [fetchMessage, setFetchMessage] = useState('');
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 1,
  });
const geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-77.032, 38.913]
      },
      properties: {
        title: 'Mapbox',
        description: 'Washington, D.C.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.414, 37.776]
      },
      properties: {
        title: 'Mapbox',
        description: 'San Francisco, California'
      }
    }
  ]
};
for (const feature of geojson.features) {

  // code from step 5-1 will go here

  // make a marker for each feature and add to the map
  new mapboxgl.Marker().setLngLat(feature.geometry.coordinates).addTo(map);  // Replace this line with code from step 5-2

   //code from step 6 will go here
}

export default App;
