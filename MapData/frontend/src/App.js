import React from 'react';
import MapComponent from './components/MapComponent';
import './components/MapStyles.css';

function App() {
  return (
    <div className="App" style={{ height: '100vh', width: '100%', overflow: 'hidden' }}>
      <MapComponent />
    </div>
  );
}

export default App; 