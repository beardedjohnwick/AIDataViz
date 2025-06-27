import React, { useEffect, useState } from 'react';
import MapComponent from './components/MapComponent';
import ControlPanel from './components/ControlPanel';
import testApiConnection from './test-api';
import { hawaiiTransformDemo } from './data/hawaiiTransformDemo';
import testHawaiiTransformation from './data/testHawaiiTransform';
import { HAWAII_CONFIG } from './data/geoUtils';

function App() {
  const [showCounties, setShowCounties] = useState(true);
  const [showAreaInTooltip, setShowAreaInTooltip] = useState(false);
  
  // Hawaii transformation settings
  const [hawaiiScale, setHawaiiScale] = useState(HAWAII_CONFIG.defaults.scale);
  const [hawaiiTranslateX, setHawaiiTranslateX] = useState(HAWAII_CONFIG.defaults.translateX);
  const [hawaiiTranslateY, setHawaiiTranslateY] = useState(HAWAII_CONFIG.defaults.translateY);

  const handleCountyToggle = () => {
    setShowCounties(!showCounties);
  };

  const handleAreaToggle = () => {
    setShowAreaInTooltip(!showAreaInTooltip);
  };
  
  // Handler for Hawaii scale change
  const handleHawaiiScaleChange = (scale) => {
    setHawaiiScale(scale);
    if (window.hawaiiTransform) {
      window.hawaiiTransform.setTransformation(scale, hawaiiTranslateX, hawaiiTranslateY);
    }
  };
  
  // Handler for Hawaii X position change
  const handleHawaiiTranslateXChange = (translateX) => {
    setHawaiiTranslateX(translateX);
    if (window.hawaiiTransform) {
      window.hawaiiTransform.setTransformation(hawaiiScale, translateX, hawaiiTranslateY);
    }
  };
  
  // Handler for Hawaii Y position change
  const handleHawaiiTranslateYChange = (translateY) => {
    setHawaiiTranslateY(translateY);
    if (window.hawaiiTransform) {
      window.hawaiiTransform.setTransformation(hawaiiScale, hawaiiTranslateX, translateY);
    }
  };
  
  // Reset Hawaii transformation to default
  const resetHawaiiTransformation = () => {
    if (window.hawaiiTransform) {
      const defaults = window.hawaiiTransform.reset();
      setHawaiiScale(defaults.scale);
      setHawaiiTranslateX(defaults.translateX);
      setHawaiiTranslateY(defaults.translateY);
    }
  };

  useEffect(() => {
    // Make the test function available in the global scope
    window.testApiConnection = testApiConnection;
    
    // Make the Hawaii transform demo available in the global scope
    window.hawaiiTransformDemo = hawaiiTransformDemo;
    
    // Make Hawaii transformation functions available globally
    window.setHawaiiScale = handleHawaiiScaleChange;
    window.setHawaiiTranslateX = handleHawaiiTranslateXChange;
    window.setHawaiiTranslateY = handleHawaiiTranslateYChange;
    window.resetHawaiiTransformation = resetHawaiiTransformation;
    
    // Make county toggle functionality available globally for testing
    window.countyToggle = showCounties;
    window.onCountyToggle = handleCountyToggle;
    
    // Make Hawaii transformation test available globally
    window.testHawaiiTransformation = testHawaiiTransformation;
    
    // Run the test automatically when in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Running API connection test...');
      testApiConnection()
        .then(result => console.log('API test result:', result))
        .catch(err => console.error('API test error:', err));
    }
  }, [hawaiiScale, hawaiiTranslateX, hawaiiTranslateY, showCounties]);
  
  return (
    <div className="App" style={{ height: '100vh', width: '100%', overflow: 'hidden' }}>
      <MapComponent showCounties={showCounties} />
      <ControlPanel
        countyToggle={showCounties}
        onCountyToggle={handleCountyToggle}
        showAreaInTooltip={showAreaInTooltip}
        onAreaToggle={handleAreaToggle}
      />
      
      {/* Hidden Hawaii transformation controls - for debugging only */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', zIndex: 1000, display: 'none' }}>
        <h4>Hawaii Transform Controls</h4>
        <div>
          <label>Scale: {hawaiiScale.toFixed(1)}</label>
          <input 
            type="range" 
            min="0.5" 
            max="2.0" 
            step="0.1" 
            value={hawaiiScale} 
            onChange={(e) => handleHawaiiScaleChange(parseFloat(e.target.value))} 
          />
        </div>
        <div>
          <label>Position X: {hawaiiTranslateX}</label>
          <input 
            type="range" 
            min="100" 
            max="250" 
            step="1" 
            value={hawaiiTranslateX} 
            onChange={(e) => handleHawaiiTranslateXChange(parseFloat(e.target.value))} 
          />
        </div>
        <div>
          <label>Position Y: {hawaiiTranslateY}</label>
          <input 
            type="range" 
            min="-50" 
            max="50" 
            step="1" 
            value={hawaiiTranslateY} 
            onChange={(e) => handleHawaiiTranslateYChange(parseFloat(e.target.value))} 
          />
        </div>
        <button onClick={resetHawaiiTransformation}>Reset</button>
      </div>
    </div>
  );
}

export default App; 