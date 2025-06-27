import React from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import './MapStyles.css';

function CountyLayers({ data, onCountySelected, showAreaInTooltip }) {
  // Get access to the map instance
  const map = useMap();

  // Style for county boundaries
  const countyStyle = {
    color: '#666',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0
  };

  // Function to format area with commas and round to 2 decimal places
  const formatArea = (area) => {
    if (area === undefined || area === null) return 'N/A';
    return area.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Function to handle hover events
  const onEachFeature = (feature, layer) => {
    // Add tooltip with county name and area
    if (feature.properties) {
      const countyName = feature.properties.name || 'Unknown';
      const areaContent = showAreaInTooltip && feature.properties.area_sq_miles !== undefined 
        ? `<br>Area: ${formatArea(feature.properties.area_sq_miles)} sq mi` 
        : '';
      
      layer.bindTooltip(
        `<div class="custom-tooltip">
          <strong>${countyName}</strong>
          ${areaContent}
        </div>`, 
        {
          permanent: false,
          direction: 'auto',
          className: 'county-tooltip',
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

  // Use key to force re-render when showAreaInTooltip changes
  return (
    <GeoJSON 
      key={`counties-${showAreaInTooltip}`}
      data={data} 
      style={countyStyle}
      onEachFeature={onEachFeature}
      className="map-feature-no-focus"
    />
  );
}

export default CountyLayers; 