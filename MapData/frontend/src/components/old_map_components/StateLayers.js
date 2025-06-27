import React from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import './MapStyles.css';

function StateLayers({ data, onStateSelected, showAreaInTooltip }) {
  // Get access to the map instance
  const map = useMap();

  // Style for state boundaries
  const stateStyle = {
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: 0
  };

  // Function to format area with commas and round to 2 decimal places
  const formatArea = (area) => {
    if (area === undefined || area === null) return 'N/A';
    return area.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Function to handle hover and click events
  const onEachFeature = (feature, layer) => {
    // Add tooltip with state name and area
    if (feature.properties) {
      const stateName = feature.properties.name || 'Unknown';
      const areaContent = showAreaInTooltip && feature.properties.area_sq_miles !== undefined 
        ? `<br>Area: ${formatArea(feature.properties.area_sq_miles)} sq mi` 
        : '';
      
      layer.bindTooltip(
        `<div class="custom-tooltip">
          <strong>${stateName}</strong>
          ${areaContent}
        </div>`, 
        {
          permanent: false,
          direction: 'auto',
          className: 'state-tooltip',
          sticky: true, // Makes tooltip follow the mouse
          offset: [10, 0] // Small offset from cursor
        }
      );
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

  // Use key to force re-render when showAreaInTooltip changes
  return (
    <GeoJSON 
      key={`states-${showAreaInTooltip}`}
      data={data} 
      style={stateStyle}
      onEachFeature={onEachFeature}
      className="map-feature-no-focus"
    />
  );
}

export default StateLayers; 