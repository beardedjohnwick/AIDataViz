import React from 'react';
import { GeoJSON } from 'react-leaflet';

function CountyLayers({ data }) {
  // Style for county boundaries
  const countyStyle = {
    color: '#666',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0
  };

  if (!data) {
    return null;
  }

  return (
    <GeoJSON 
      data={data} 
      style={countyStyle}
    />
  );
}

export default CountyLayers; 