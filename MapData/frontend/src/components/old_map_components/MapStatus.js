import React from 'react';
import './MapStyles.css';

/**
 * Component for displaying map status information
 * @param {Object} props - Component props
 * @param {boolean} props.usingApi - Whether the app is using API data
 * @param {boolean} props.stateSelected - Whether a state is selected
 * @param {boolean} props.countySelected - Whether a county is selected
 * @param {Function} props.resetMapView - Function to reset map view
 * @param {boolean} props.isLoadingData - Whether data is currently loading
 * @param {number} props.zoomLevel - Current zoom level
 * @returns {JSX.Element} Rendered component
 */
const MapStatus = ({ 
  usingApi, 
  stateSelected, 
  countySelected, 
  resetMapView,
  isLoadingData,
  zoomLevel
}) => {
  return (
    <>
      {/* Reset button - shown when a state or county is selected */}
      {(stateSelected || countySelected) && (
        <div className="reset-button-container">
          <button 
            onClick={resetMapView}
            className="reset-button"
          >
            Reset Map View
          </button>
        </div>
      )}
      
      {/* Data source indicator */}
      <div className="data-source-indicator">
        <div>
          {usingApi 
            ? 'Using API data (Live database connection)' 
            : 'Using static data with mock area values (API unavailable)'}
        </div>
        <div>
          Zoom Level: {zoomLevel} 
          {zoomLevel >= 6 
            ? ' (Counties visible)' 
            : ' (Zoom in to see counties)'}
        </div>
        {isLoadingData && (
          <div className="loading-spinner">
            Loading data...
          </div>
        )}
      </div>
    </>
  );
};

export default MapStatus; 