import React, { useEffect } from 'react';
import MapComponent from './components/MapComponent';
import testApiConnection from './test-api';
import './components/MapStyles.css';

function App() {
  useEffect(() => {
    // Make the test function available in the global scope
    window.testApiConnection = testApiConnection;
    
    // Run the test automatically when in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Running API connection test...');
      testApiConnection()
        .then(result => console.log('API test result:', result))
        .catch(err => console.error('API test error:', err));
    }
  }, []);
  
  return (
    <div className="App" style={{ height: '100vh', width: '100%', overflow: 'hidden' }}>
      <MapComponent />
    </div>
  );
}

export default App; 