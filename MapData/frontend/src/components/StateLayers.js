import React from 'react';
import { GeoJSON } from 'react-leaflet';

function StateLayers({ data }) {
  // Style for state boundaries
  const stateStyle = {
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: 0
  };

  if (!data) {
    return null;
  }

  return (
    <GeoJSON 
      data={data} 
      style={stateStyle}
    />
  );
}

export default StateLayers; 