import React from 'react';
import { GeoJSON, useMap } from 'react-leaflet';

function StateLayers({ data, onStateSelected }) {
  // Get access to the map instance
  const map = useMap();

  // Style for state boundaries
  const stateStyle = {
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: 0
  };

  // Function to handle hover and click events
  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0.3,
          fillColor: '#cccccc'
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0,
          fillColor: '#ffffff'
        });
      },
      click: (e) => {
        // Get the bounds of the clicked state
        const bounds = e.target.getBounds();
        
        // Zoom to the bounds of the state with some padding
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 8,
          animate: true
        });
        
        // Notify parent that a state has been selected
        if (onStateSelected) {
          onStateSelected(true, feature.properties.name);
        }
      }
    });
  };

  if (!data) {
    return null;
  }

  return (
    <GeoJSON 
      data={data} 
      style={stateStyle}
      onEachFeature={onEachFeature}
    />
  );
}

export default StateLayers; 