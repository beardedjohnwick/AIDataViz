import axios from 'axios';
// Import static data for fallback
import statesData from './us-states.json';

// Define the API base URL
// In development, this would point to the FastAPI server
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Service to fetch geographic data
export const geoDataService = {
  // Get all states with their properties
  getStates: async (includeGeometry = true) => {
    try {
      console.log(`Requesting states data from ${API_BASE_URL}/geographic/states with include_geometry=${includeGeometry}`);
      const response = await apiClient.get(`/geographic/states`, {
        params: { include_geometry: includeGeometry }
      });
      console.log('States API response status:', response.status);
      
      // Validate the response data
      const data = response.data;
      
      // Check if Alaska exists in the data using more comprehensive checks
      const alaskaFeature = data.features.find(feature => {
        const props = feature.properties || {};
        const name = (props.name || props.NAME || '').toLowerCase();
        const fips = props.fips_code || props.STATE || props.STATEFP || '';
        return name === 'alaska' || fips === '02';
      });
      
      console.log('Alaska found in API response:', !!alaskaFeature);
      if (alaskaFeature) {
        console.log('Alaska properties:', alaskaFeature.properties);
      } else {
        console.log('No Alaska found. Checking first few features:');
        const sampleSize = Math.min(3, data.features.length);
        for (let i = 0; i < sampleSize; i++) {
          console.log(`Feature ${i} properties:`, data.features[i].properties);
        }
      }
      
      // Check for Hawaii
      const hawaiiFeature = data.features.find(feature => {
        const props = feature.properties || {};
        const name = (props.name || props.NAME || '').toLowerCase();
        const fips = props.fips_code || props.STATE || props.STATEFP || '';
        return name === 'hawaii' || fips === '15';
      });
      
      console.log('Hawaii found in API response:', !!hawaiiFeature);
      if (hawaiiFeature) {
        console.log('Hawaii properties:', hawaiiFeature.properties);
      }
      
      // Check if area_sq_miles exists in properties
      if (data.features.length > 0) {
        const sampleFeature = data.features[0];
        if (!sampleFeature.properties || !('area_sq_miles' in sampleFeature.properties)) {
          console.warn('area_sq_miles not found in state properties');
        }
      }
      
      // Return the unmodified data from the API
      console.log('Returning states data from API service');
      return data;
    } catch (error) {
      console.error('Error fetching states data:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        console.error('Is the backend server running? Check http://localhost:8000/api/v1/geographic/health');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
      }
      
      // Use local static data as fallback
      console.log('Using local static data as fallback');
      return statesData;
    }
  },
  
  // Get counties, optionally filtered by state
  getCounties: async (includeGeometry = true, stateId = null) => {
    try {
      const params = { include_geometry: includeGeometry };
      if (stateId) {
        params.state_id = stateId;
      }
      
      console.log(`Requesting counties data from ${API_BASE_URL}/geographic/counties with params:`, params);
      const response = await apiClient.get(`/geographic/counties`, { params });
      console.log('Counties API response status:', response.status);
      
      // Validate the response data
      const data = response.data;
      if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
        console.error('Invalid GeoJSON response structure:', data);
        throw new Error('Invalid GeoJSON response structure');
      }
      
      // Check for Alaska counties
      const alaskaCounties = data.features.filter(feature => {
        const props = feature.properties || {};
        const stateId = props.state_id;
        return stateId === 'b2785b90-a07d-4f9a-90d7-10edc3a6fe00'; // Known Alaska ID
      });
      console.log(`Found ${alaskaCounties.length} Alaska counties`);
      
      // Check for Hawaii counties
      const hawaiiCounties = data.features.filter(feature => {
        const props = feature.properties || {};
        // This would need to be updated with the actual Hawaii state ID from the database
        const name = (props.name || '').toLowerCase();
        return name.includes('hawaii') || name.includes('honolulu') || name.includes('maui') || name.includes('kauai');
      });
      console.log(`Found ${hawaiiCounties.length} Hawaii counties`);
      if (hawaiiCounties.length === 0) {
        console.log('No Hawaii counties found. This may be expected if Hawaii counties are not in the database.');
      }
      
      // Check if area_sq_miles exists in properties
      if (data.features.length > 0) {
        const sampleFeature = data.features[0];
        if (!sampleFeature.properties || !('area_sq_miles' in sampleFeature.properties)) {
          console.warn('area_sq_miles not found in county properties');
        }
      }
      
      // Return the unmodified data from the API
      console.log('Returning counties data from API service');
      return data;
    } catch (error) {
      console.error('Error fetching counties data:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        console.error('Is the backend server running? Check http://localhost:8000/api/v1/geographic/health');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },
  
  // Check API health
  checkHealth: async () => {
    try {
      console.log(`Checking API health at ${API_BASE_URL}/geographic/health`);
      const response = await apiClient.get(`/geographic/health`);
      console.log('Health check response:', response.data);
      return response.data.status === 'ok';
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
};

export default geoDataService; 