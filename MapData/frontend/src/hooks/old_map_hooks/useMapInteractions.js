import { useState, useCallback } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Custom hook for handling map interactions
 * @returns {Object} - Map interaction handlers and state
 */
const useMapInteractions = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const map = useMap();

  // Handle hover over a feature
  const handleFeatureHover = useCallback((e, feature) => {
    if (e && e.target) {
      // Highlight the hovered feature
      e.target.setStyle({
        fillColor: '#E0E0E0',
        fillOpacity: 0.5
      });
      
      // Reset the style when mouse leaves
      e.target.on('mouseout', () => {
        e.target.setStyle({
          fillColor: 'transparent',
          fillOpacity: 0
        });
      });
    }
    
    // Set the hovered feature for tooltip display
    setHoveredFeature(feature);
    
    // Set tooltip position to mouse position
    if (e && e.latlng) {
      setTooltipPosition(e.latlng);
    }
  }, []);

  // Handle click on a feature
  const handleFeatureClick = useCallback((e, feature) => {
    if (!feature || !feature.geometry) {
      return;
    }
    
    // Calculate bounds of the feature
    let bounds;
    if (e && e.target && e.target.getBounds) {
      bounds = e.target.getBounds();
    } else {
      // Fallback if bounds not available from the event
      return;
    }
    
    // Zoom to the feature with some padding
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 10,
      animate: true,
      duration: 1.0
    });
  }, [map]);

  // Clear hover state
  const clearHover = useCallback(() => {
    setHoveredFeature(null);
    setTooltipPosition(null);
  }, []);

  return {
    hoveredFeature,
    tooltipPosition,
    handleFeatureHover,
    handleFeatureClick,
    clearHover
  };
};

export default useMapInteractions; 