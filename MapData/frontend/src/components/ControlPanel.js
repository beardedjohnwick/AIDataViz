import React from 'react';
import './MapStyles.css';

function ControlPanel({ 
  countyToggle, 
  onCountyToggle
}) {
  return (
    <div className="control-panel">
      <h3 className="control-panel-title">Map Controls</h3>
      
      <div className="control-panel-section">
        <label className="control-toggle">
          <input 
            type="checkbox" 
            checked={countyToggle} 
            onChange={onCountyToggle} 
          />
          <span className="toggle-label">Show County Lines</span>
        </label>
      </div>
    </div>
  );
}

export default ControlPanel; 