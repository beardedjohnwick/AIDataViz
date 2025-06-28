import React, { useState, useEffect } from 'react';
import './MapStyles.css';

function ControlPanel({ 
  countyToggle, 
  onCountyToggle,
  showAreaInTooltip,
  onAreaToggle,
  onCollapseChange,
  onCommandSubmit
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  
  const togglePanel = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };
  
  const handleCommandChange = (e) => {
    setCommandInput(e.target.value);
  };
  
  const handleCommandSubmit = () => {
    if (commandInput.trim() && onCommandSubmit) {
      onCommandSubmit(commandInput);
      setCommandInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && commandInput.trim()) {
      handleCommandSubmit();
    }
  };

  return (
    <div className={`control-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="control-panel-header">
        <button 
          className="panel-toggle-button"
          onClick={togglePanel}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {collapsed ? '←' : '→'}
        </button>
        <h3 className="control-panel-title">Map Controls</h3>
      </div>
      
      <div className="control-panel-content">
        {/* Map Command Input Section */}
        <div className="control-panel-section">
          <h4 className="section-title">Map Commands</h4>
          <div className="command-input-container">
            <input
              type="text"
              className="command-input"
              placeholder="Type map command here..."
              value={commandInput}
              onChange={handleCommandChange}
              onKeyPress={handleKeyPress}
              aria-label="Map command input"
            />
            <button 
              className="command-submit-button"
              onClick={handleCommandSubmit}
              aria-label="Submit command"
            >
              Submit
            </button>
          </div>
          <div className="command-help">
            <p>Available commands:</p>
            <ul>
              <li>highlight California red</li>
              <li>highlight Texas blue</li>
              <li>clear highlights</li>
            </ul>
          </div>
        </div>
        
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