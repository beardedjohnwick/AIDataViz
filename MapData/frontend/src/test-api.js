import axios from 'axios';

// Define the API base URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Test function to run in browser console
async function testApiConnection() {
  console.log('Testing API connection from frontend...');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/geographic/health`);
    console.log('Health endpoint status:', healthResponse.status);
    console.log('Health endpoint data:', healthResponse.data);
    
    // Test states endpoint without geometry
    console.log('Testing states endpoint without geometry...');
    const statesResponse = await axios.get(`${API_BASE_URL}/geographic/states`, {
      params: { include_geometry: false }
    });
    console.log('States endpoint status:', statesResponse.status);
    console.log('States count:', statesResponse.data.features.length);
    
    // Check if states have area_sq_miles
    const sampleState = statesResponse.data.features[0];
    console.log('Sample state:', sampleState.properties.name);
    console.log('Sample state area:', sampleState.properties.area_sq_miles || 'Not found');
    
    // Test states endpoint with geometry
    console.log('Testing states endpoint with geometry...');
    const statesGeoResponse = await axios.get(`${API_BASE_URL}/geographic/states`, {
      params: { include_geometry: true }
    });
    console.log('States with geometry endpoint status:', statesGeoResponse.status);
    console.log('States with geometry count:', statesGeoResponse.data.features.length);
    
    // Check if states have geometry
    const sampleStateGeo = statesGeoResponse.data.features[0];
    const hasGeometry = sampleStateGeo.geometry.type !== 'Point' || (
      sampleStateGeo.geometry.coordinates[0] !== 0 && 
      sampleStateGeo.geometry.coordinates[1] !== 0
    );
    console.log('Sample state geometry type:', sampleStateGeo.geometry.type);
    console.log('Has valid geometry:', hasGeometry);
    
    return 'API tests completed successfully';
  } catch (error) {
    console.error('Error testing API:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return 'API tests failed';
  }
}

// Export the test function to be used in the browser console
window.testApiConnection = testApiConnection;

export default testApiConnection; 