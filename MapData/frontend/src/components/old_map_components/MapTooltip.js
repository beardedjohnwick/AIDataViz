import React from 'react';

/**
 * Tooltip component to display information about the hovered map feature
 * @param {Object} props - Component props
 * @param {Object} props.feature - The hovered feature
 * @param {Object} props.position - The position of the tooltip
 * @returns {React.Component} - Tooltip component
 */
const MapTooltip = ({ feature, position }) => {
  if (!feature || !position) {
    return null;
  }

  const { properties } = feature;
  const name = properties?.name || 'Unknown';

  const tooltipStyle = {
    position: 'absolute',
    left: `${position.x + 10}px`,
    top: `${position.y - 30}px`,
    backgroundColor: 'white',
    padding: '5px 8px',
    borderRadius: '4px',
    boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
    zIndex: 1000,
    pointerEvents: 'none',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  return (
    <div style={tooltipStyle}>
      {name}
    </div>
  );
};

export default MapTooltip; 