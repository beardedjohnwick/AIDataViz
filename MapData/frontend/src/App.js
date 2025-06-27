import React, { useEffect, useState } from 'react';
import MapComponent from './components/MapComponent';
import ControlPanel from './components/ControlPanel';
import testApiConnection from './test-api';
import { hawaiiTransformDemo } from './data/hawaiiTransformDemo';
import { alaskaTransformDemo } from './data/alaskaTransformDemo';
import testHawaiiTransformation from './data/testHawaiiTransform';
import { HAWAII_CONFIG, ALASKA_CONFIG } from './data/geoUtils';

function App() {
  const [showCounties, setShowCounties] = useState(false);
  const [showAreaInTooltip, setShowAreaInTooltip] = useState(false);
  
  // Hawaii transformation settings
  const [hawaiiScale, setHawaiiScale] = useState(HAWAII_CONFIG.defaults.scale);
  const [hawaiiTranslateX, setHawaiiTranslateX] = useState(HAWAII_CONFIG.defaults.translateX);
  const [hawaiiTranslateY, setHawaiiTranslateY] = useState(HAWAII_CONFIG.defaults.translateY);
  
  // Alaska transformation settings
  const [alaskaScale, setAlaskaScale] = useState(ALASKA_CONFIG.defaults.scale);
  const [alaskaScaleY, setAlaskaScaleY] = useState(ALASKA_CONFIG.defaults.scaleY);
  const [alaskaTranslateX, setAlaskaTranslateX] = useState(ALASKA_CONFIG.defaults.translateX);
  const [alaskaTranslateY, setAlaskaTranslateY] = useState(ALASKA_CONFIG.defaults.translateY);

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
  
  // Handler for Alaska scale change
  const handleAlaskaScaleChange = (scale) => {
    setAlaskaScale(scale);
    if (window.alaskaTransform) {
      window.alaskaTransform.setTransformation(scale, alaskaTranslateX, alaskaTranslateY, alaskaScaleY);
    }
  };
  
  // Handler for Alaska Y scale change
  const handleAlaskaScaleYChange = (scaleY) => {
    setAlaskaScaleY(scaleY);
    if (window.alaskaTransform) {
      window.alaskaTransform.setTransformation(alaskaScale, alaskaTranslateX, alaskaTranslateY, scaleY);
    }
  };
  
  // Handler for Alaska X position change
  const handleAlaskaTranslateXChange = (translateX) => {
    setAlaskaTranslateX(translateX);
    if (window.alaskaTransform) {
      window.alaskaTransform.setTransformation(alaskaScale, translateX, alaskaTranslateY, alaskaScaleY);
    }
  };
  
  // Handler for Alaska Y position change
  const handleAlaskaTranslateYChange = (translateY) => {
    setAlaskaTranslateY(translateY);
    if (window.alaskaTransform) {
      window.alaskaTransform.setTransformation(alaskaScale, alaskaTranslateX, translateY, alaskaScaleY);
    }
  };
  
  // Reset Alaska transformation to default
  const resetAlaskaTransformation = () => {
    if (window.alaskaTransform) {
      const defaults = window.alaskaTransform.reset();
      setAlaskaScale(defaults.scale);
      setAlaskaScaleY(defaults.scaleY);
      setAlaskaTranslateX(defaults.translateX);
      setAlaskaTranslateY(defaults.translateY);
    }
  };

  useEffect(() => {
    // Make the test function available in the global scope
    window.testApiConnection = testApiConnection;
    
    // Make the Hawaii transform demo available in the global scope
    window.hawaiiTransformDemo = hawaiiTransformDemo;
    
    // Make the Alaska transform demo available in the global scope
    window.alaskaTransformDemo = alaskaTransformDemo;
    
    // Make Hawaii transformation functions available globally
    window.setHawaiiScale = handleHawaiiScaleChange;
    window.setHawaiiTranslateX = handleHawaiiTranslateXChange;
    window.setHawaiiTranslateY = handleHawaiiTranslateYChange;
    window.resetHawaiiTransformation = resetHawaiiTransformation;
    
    // Make Alaska transformation functions available globally
    window.setAlaskaScale = handleAlaskaScaleChange;
    window.setAlaskaScaleY = handleAlaskaScaleYChange;
    window.setAlaskaTranslateX = handleAlaskaTranslateXChange;
    window.setAlaskaTranslateY = handleAlaskaTranslateYChange;
    window.resetAlaskaTransformation = resetAlaskaTransformation;
    
    // Make county toggle functionality available globally for testing
    window.countyToggle = showCounties;
    window.onCountyToggle = handleCountyToggle;
    
    // Make Hawaii transformation test available globally
    window.testHawaiiTransformation = testHawaiiTransformation;
    
    // Create Alaska transformation test function
    window.testAlaskaTransformation = () => {
      console.log('Testing Alaska transformation...');
      
      // Test 1: Scale Alaska
      window.alaskaTransform.setTransformation(0.5, 45, -100, 0.7);
      console.log('Test 1: Scaled Alaska to 0.5x horizontally, 0.7x vertically');
      
      setTimeout(() => {
        // Test 2: Move Alaska horizontally
        window.alaskaTransform.setTransformation(0.5, 60, -100, 0.7);
        console.log('Test 2: Moved Alaska right');
        
        setTimeout(() => {
          // Test 3: Move Alaska vertically
          window.alaskaTransform.setTransformation(0.5, 60, -80, 0.7);
          console.log('Test 3: Moved Alaska up');
          
          setTimeout(() => {
            // Test 4: Reset Alaska
            window.alaskaTransform.reset();
            console.log('Test 4: Reset Alaska to default position');
            console.log('Alaska transformation test complete!');
          }, 2000);
        }, 2000);
      }, 2000);
    };
    
    // Run the test automatically when in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Running API connection test...');
      testApiConnection()
        .then(result => console.log('API test result:', result))
        .catch(err => console.error('API test error:', err));
    }
  }, [hawaiiScale, hawaiiTranslateX, hawaiiTranslateY, alaskaScale, alaskaScaleY, alaskaTranslateX, alaskaTranslateY, showCounties]);
  
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
      
      {/* Hidden Alaska transformation controls - for debugging only */}
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', zIndex: 1000, display: 'none' }}>
        <h4>Alaska Transform Controls</h4>
        <div>
          <label>Scale X: {alaskaScale.toFixed(2)}</label>
          <input 
            type="range" 
            min="0.1" 
            max="1.0" 
            step="0.05" 
            value={alaskaScale} 
            onChange={(e) => handleAlaskaScaleChange(parseFloat(e.target.value))} 
          />
        </div>
        <div>
          <label>Scale Y: {alaskaScaleY.toFixed(2)}</label>
          <input 
            type="range" 
            min="0.1" 
            max="1.0" 
            step="0.05" 
            value={alaskaScaleY} 
            onChange={(e) => handleAlaskaScaleYChange(parseFloat(e.target.value))} 
          />
        </div>
        <div>
          <label>Position X: {alaskaTranslateX}</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1" 
            value={alaskaTranslateX} 
            onChange={(e) => handleAlaskaTranslateXChange(parseFloat(e.target.value))} 
          />
        </div>
        <div>
          <label>Position Y: {alaskaTranslateY}</label>
          <input 
            type="range" 
            min="-150" 
            max="0" 
            step="1" 
            value={alaskaTranslateY} 
            onChange={(e) => handleAlaskaTranslateYChange(parseFloat(e.target.value))} 
          />
        </div>
        <button onClick={resetAlaskaTransformation}>Reset</button>
      </div>
    </div>
  );
}

export default App; 