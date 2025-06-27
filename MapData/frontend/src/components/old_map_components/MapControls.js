import React from 'react';

/**
 * Map controls component with toggle for county visibility
 * @param {Object} props - Component props
 * @param {boolean} props.showCounties - Whether counties are visible
 * @param {Function} props.toggleCounties - Function to toggle county visibility
 * @returns {React.Component} - Map controls component
 */
const MapControls = ({ showCounties, toggleCounties }) => {
  const controlsStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '4px',
    boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
    zIndex: 1000
  };

  const checkboxStyle = {
    marginRight: '8px',
    cursor: 'pointer'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    cursor: 'pointer'
  };

  return (
    <div style={controlsStyle}>
      <label style={labelStyle}>
        <input
          type="checkbox"
          checked={showCounties}
          onChange={toggleCounties}
          style={checkboxStyle}
        />
        Show Counties
      </label>
    </div>
  );
};

export default MapControls; 