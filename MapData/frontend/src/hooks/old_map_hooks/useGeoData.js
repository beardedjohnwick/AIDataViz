import { useState, useEffect, useCallback, useRef } from 'react';
import { geoDataService, healthService } from '../data/apiService';
import { convertTopoToGeoStates, convertTopoToGeoCounties, repositionAlaskaHawaii } from '../data/geoUtils';
import statesTopoJSON from '../data/us-states.json';
import countiesTopoJSON from '../data/us-counties.json';

// Simple cache key generator for geographic data
const createCacheKey = (type, options) => {
  const { zoomLevel, bounds, stateId } = options || {};
  
  let key = `${type}`;
  
  if (zoomLevel !== undefined) {
    key += `-z${zoomLevel}`;
  }
  
  if (bounds) {
    // Round coordinates to 1 decimal place to avoid too many cache entries
    const roundedBounds = {
      north: Math.round(bounds.north * 10) / 10,
      south: Math.round(bounds.south * 10) / 10,
      east: Math.round(bounds.east * 10) / 10,
      west: Math.round(bounds.west * 10) / 10
    };
    key += `-b${roundedBounds.west},${roundedBounds.south},${roundedBounds.east},${roundedBounds.north}`;
  }
  
  if (stateId) {
    key += `-s${stateId}`;
  }
  
  return key;
};

/**
 * Custom hook for fetching and managing geographic data
 * @returns {Object} State data, loading states, and utility functions
 */
const useGeoData = () => {
  const [statesData, setStatesData] = useState(null);
  const [countiesData, setCountiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingApi, setUsingApi] = useState(true);
  
  // Cache for storing fetched data
  const dataCache = useRef({});

  /**
   * Validates GeoJSON data structure
   * @param {Object} data - GeoJSON data to validate
   * @returns {boolean} True if data is valid GeoJSON
   */
  const validateGeoJSON = useCallback((data) => {
    if (!data || !data.type || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      console.error('Invalid GeoJSON data structure:', data);
      return false;
    }
    
    // Check if features have properties and geometry
    if (data.features.length === 0) {
      console.error('GeoJSON has no features');
      return false;
    }
    
    for (const feature of data.features) {
      if (!feature.properties || !feature.geometry) {
        console.error('Feature missing properties or geometry:', feature);
        return false;
      }
    }
    
    return true;
  }, []);

  /**
   * Check API health before loading data
   * @returns {Promise<boolean>} True if API is healthy
   */
  const checkApiHealth = useCallback(async () => {
    try {
      const isHealthy = await healthService.checkHealth();
      return isHealthy;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }, []);

  /**
   * Load states data from API or fallback to static files
   * @param {Object} options - Options for loading states data
   * @param {number} options.zoomLevel - Current map zoom level
   * @param {Object} options.bounds - Current map bounds
   * @param {boolean} options.forceRefresh - Whether to force a refresh bypassing cache
   */
  const loadStatesData = useCallback(async (options = {}) => {
    try {
      const { zoomLevel, bounds, forceRefresh } = options;
      setLoading(true);
      
      console.log('Fetching states data with options:', options);
      
      // First check if API is healthy
      const isApiHealthy = await checkApiHealth();
      
      if (!isApiHealthy) {
        console.warn('API health check failed, falling back to static files');
        throw new Error('API health check failed');
      }
      
      // Create cache key
      const cacheKey = createCacheKey('states', { zoomLevel, bounds });
      
      // Check cache first unless forceRefresh is true
      if (!forceRefresh && dataCache.current[cacheKey]) {
        console.log(`Using cached states data for key: ${cacheKey}`);
        setStatesData(dataCache.current[cacheKey]);
        setUsingApi(true);
        setLoading(false);
        return;
      }
      
      // Fetch from API with options
      const apiOptions = {
        zoomLevel,
        bounds
      };
      
      const statesResponse = await geoDataService.getStates(true, apiOptions);
      console.log('States data from API:', statesResponse);
      
      // Validate the GeoJSON data
      if (validateGeoJSON(statesResponse)) {
        console.log('API data is valid GeoJSON, applying Alaska/Hawaii repositioning...');
        
        // Apply repositionAlaskaHawaii to ensure Alaska and Hawaii are properly positioned
        const repositionedStatesData = repositionAlaskaHawaii(statesResponse);
        
        // Store in cache
        dataCache.current[cacheKey] = repositionedStatesData;
        
        setStatesData(repositionedStatesData);
        setUsingApi(true);
      } else {
        console.error('Invalid GeoJSON data received from API, falling back to static files');
        throw new Error('Invalid GeoJSON data');
      }
    } catch (err) {
      console.error('Error loading data from API:', err);
      console.log('Falling back to static files...');
      
      // Fallback to static files
      const staticStatesData = convertTopoToGeoStates(statesTopoJSON);
      
      setStatesData(staticStatesData);
      setUsingApi(false);
    } finally {
      setLoading(false);
    }
  }, [checkApiHealth, validateGeoJSON]);

  /**
   * Load counties data from API or fallback to static files
   * @param {boolean} shouldLoad - Whether to load counties data
   * @param {Object} options - Options for loading counties data
   * @param {string} options.stateId - Optional state ID to filter counties
   * @param {number} options.zoomLevel - Current map zoom level
   * @param {Object} options.bounds - Current map bounds
   * @param {boolean} options.forceRefresh - Whether to force a refresh bypassing cache
   */
  const loadCountiesData = useCallback(async (shouldLoad, options = {}) => {
    if (shouldLoad && usingApi) {
      try {
        const { stateId, zoomLevel, bounds, forceRefresh } = options;
        setLoading(true);
        
        console.log('Fetching counties data with options:', options);
        
        // Create cache key
        const cacheKey = createCacheKey('counties', { zoomLevel, bounds, stateId });
        
        // Check cache first unless forceRefresh is true
        if (!forceRefresh && dataCache.current[cacheKey]) {
          console.log(`Using cached counties data for key: ${cacheKey}`);
          setCountiesData(dataCache.current[cacheKey]);
          setLoading(false);
          return;
        }
        
        // Fetch from API with options
        const apiOptions = {
          zoomLevel,
          bounds
        };
        
        const countiesResponse = await geoDataService.getCounties(true, stateId, apiOptions);
        
        if (validateGeoJSON(countiesResponse)) {
          // Apply repositionAlaskaHawaii to ensure Alaska and Hawaii counties are properly positioned
          const repositionedCountiesData = repositionAlaskaHawaii(countiesResponse);
          
          // Store in cache
          dataCache.current[cacheKey] = repositionedCountiesData;
          
          setCountiesData(repositionedCountiesData);
        } else {
          throw new Error('Invalid counties GeoJSON data');
        }
      } catch (err) {
        console.error('Error loading counties data:', err);
        setError('Failed to load counties data');
        
        // Fallback to static counties data
        const staticCountiesData = convertTopoToGeoCounties(countiesTopoJSON);
        const repositionedCountiesData = repositionAlaskaHawaii(staticCountiesData);
        setCountiesData(repositionedCountiesData);
      } finally {
        setLoading(false);
      }
    }
  }, [usingApi, validateGeoJSON]);

  // Load states data on initial mount
  useEffect(() => {
    loadStatesData();
  }, [loadStatesData]);

  /**
   * Clear the data cache
   */
  const clearCache = useCallback(() => {
    console.log('Clearing geographic data cache');
    dataCache.current = {};
  }, []);

  return {
    statesData,
    countiesData,
    loading,
    error,
    usingApi,
    loadCountiesData,
    loadStatesData,
    clearCache
  };
};

export default useGeoData; 