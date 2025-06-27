import axios from 'axios';

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
      if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
        console.error('Invalid GeoJSON response structure:', data);
        throw new Error('Invalid GeoJSON response structure');
      }
      
      // Check if features have area_sq_miles
      if (data.features.length > 0) {
        const firstFeature = data.features[0];
        if (!firstFeature.properties || !('area_sq_miles' in firstFeature.properties)) {
          console.warn('area_sq_miles not found in state properties');
        }
      }
      
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
      throw error;
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
      
      // Check if features have area_sq_miles
      if (data.features.length > 0) {
        const firstFeature = data.features[0];
        if (!firstFeature.properties || !('area_sq_miles' in firstFeature.properties)) {
          console.warn('area_sq_miles not found in county properties');
        }
      }
      
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