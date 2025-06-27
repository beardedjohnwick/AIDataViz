// Simple test script to verify API connectivity from the frontend
import axios from 'axios';

// API endpoint URL
const API_URL = 'http://localhost:8000/api/v1/geographic/states';

// Function to test the API
async function testApi() {
  console.log('Testing API connection from frontend...');
  
  try {
    // Make a request to the API with include_geometry=true
    const response = await axios.get(API_URL, {
      params: { include_geometry: true }
    });
    
    // Check if the request was successful
    if (response.status === 200) {
      console.log(`✅ API request successful (status code: ${response.status})`);
      
      // Check if the response is a valid GeoJSON FeatureCollection
      const data = response.data;
      if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
        console.log(`✅ Response is a valid GeoJSON FeatureCollection with ${data.features.length} features`);
        
        // Check if we have features
        if (data.features.length > 0) {
          // Check the first feature
          const firstFeature = data.features[0];
          
          // Check if the feature has properties and geometry
          if (firstFeature.properties && firstFeature.geometry) {
            console.log('✅ Features have properties and geometry');
            
            // Check if area_sq_miles is in properties
            if ('area_sq_miles' in firstFeature.properties) {
              const area = firstFeature.properties.area_sq_miles;
              const name = firstFeature.properties.name;
              console.log(`✅ area_sq_miles found in properties: ${name} = ${area} sq miles`);
            } else {
              console.log('❌ area_sq_miles not found in properties');
            }
            
            // Print a sample of the properties
            console.log('\nSample properties from first feature:');
            Object.entries(firstFeature.properties).forEach(([key, value]) => {
              console.log(`  - ${key}: ${value}`);
            });
          } else {
            console.log('❌ Features missing properties or geometry');
          }
        } else {
          console.log('❌ No features found in the response');
        }
      } else {
        console.log('❌ Response is not a valid GeoJSON FeatureCollection');
        console.log(`Actual response type: ${data.type || 'unknown'}`);
      }
    } else {
      console.log(`❌ API request failed with status code: ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(`❌ Error: ${error.message}`);
      console.log(`Status code: ${error.response.status}`);
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('❌ No response received. Is the API server running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Run the test
testApi(); 