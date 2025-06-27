import React, { useState } from 'react';
import './MapStyles.css';

function ControlPanel({ 
  countyToggle, 
  onCountyToggle,
  showAreaInTooltip,
  onAreaToggle
}) {
  const [collapsed, setCollapsed] = useState(false);
  
  const togglePanel = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`control-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="control-panel-header">
        <h3 className="control-panel-title">Map Controls</h3>
        <button 
          className="panel-toggle-button"
          onClick={togglePanel}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="control-panel-content">
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
        
        <div className="control-panel-section">
          <h4 className="section-title">Data</h4>
          <div className="data-controls">
            <p className="data-description">Select data to display on the map</p>
            <label className="control-toggle">
              <input 
                type="checkbox" 
                checked={showAreaInTooltip} 
                onChange={onAreaToggle} 
              />
              <span className="toggle-label">Land Area</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel; 