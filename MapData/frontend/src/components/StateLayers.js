import React from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import './MapStyles.css';

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
    // Add tooltip with state name
    if (feature.properties && feature.properties.name) {
      layer.bindTooltip(feature.properties.name, {
        permanent: false,
        direction: 'auto',
        className: 'state-tooltip',
        sticky: true, // Makes tooltip follow the mouse
        offset: [10, 0] // Small offset from cursor
      });
    }

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
        // Prevent default behavior that might cause focus styling
        e.originalEvent.preventDefault();
        
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
      className="map-feature-no-focus"
    />
  );
}

export default StateLayers; 