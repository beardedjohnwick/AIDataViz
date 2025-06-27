import React from 'react';
import { GeoJSON, useMap } from 'react-leaflet';

function CountyLayers({ data, onCountySelected }) {
  // Get access to the map instance
  const map = useMap();

  // Style for county boundaries
  const countyStyle = {
    color: '#666',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0
  };

  // Function to handle hover events
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
        // Get the bounds of the clicked county
        const bounds = e.target.getBounds();
        
        // Zoom to the bounds of the county with some padding
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 10,
          animate: true
        });
        
        // Notify parent that a county has been selected
        if (onCountySelected) {
          onCountySelected(true, feature.properties.name);
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
      style={countyStyle}
      onEachFeature={onEachFeature}
    />
  );
}

export default CountyLayers; 