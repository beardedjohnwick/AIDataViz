import { useState, useEffect } from 'react';
import { geoDataService } from '../data/apiService';
import { transformGeoJSON } from '../utils/transformGeometry';

/**
 * Custom hook for fetching and managing map data
 * @returns {Object} - States and counties data, loading states, and error information
 */
const useMapData = () => {
  const [statesData, setStatesData] = useState(null);
  const [countiesData, setCountiesData] = useState(null);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCounties, setIsLoadingCounties] = useState(false);
  const [error, setError] = useState(null);

  // Fetch states data
  useEffect(() => {
    const fetchStatesData = async () => {
      setIsLoadingStates(true);
      setError(null);
      
      try {
        const data = await geoDataService.getStates(true);
        
        // Debug: Check if Alaska and Hawaii are in the data
        const hasAlaska = data.features.some(feature => {
          const props = feature.properties || {};
          return props.name === 'Alaska' || props.fips_code === '02';
        });
        
        const hasHawaii = data.features.some(feature => {
          const props = feature.properties || {};
          return props.name === 'Hawaii' || props.fips_code === '15';
        });
        
        console.log('Data includes Alaska:', hasAlaska);
        console.log('Data includes Hawaii:', hasHawaii);
        
        // Transform Alaska and Hawaii
        const transformedData = transformGeoJSON(data);
        
        // Debug: Check if Alaska and Hawaii are still in the transformed data
        const hasAlaskaAfterTransform = transformedData.features.some(feature => {
          const props = feature.properties || {};
          return props.name === 'Alaska' || props.fips_code === '02';
        });
        
        const hasHawaiiAfterTransform = transformedData.features.some(feature => {
          const props = feature.properties || {};
          return props.name === 'Hawaii' || props.fips_code === '15';
        });
        
        console.log('Transformed data includes Alaska:', hasAlaskaAfterTransform);
        console.log('Transformed data includes Hawaii:', hasHawaiiAfterTransform);
        
        setStatesData(transformedData);
      } catch (err) {
        console.error('Error fetching states data:', err);
        setError('Failed to load states data. Please try again later.');
      } finally {
        setIsLoadingStates(false);
      }
    };

    fetchStatesData();
  }, []);

  // Function to fetch counties data
  const fetchCountiesData = async () => {
    setIsLoadingCounties(true);
    setError(null);
    
    try {
      const data = await geoDataService.getCounties(true);
      
      // Debug: Check for Alaska and Hawaii counties
      const alaskaCounties = data.features.filter(feature => {
        const props = feature.properties || {};
        // Check for Alaska state ID or county names containing Alaska
        return props.state_id === 'b2785b90-a07d-4f9a-90d7-10edc3a6fe00' || 
               (props.name && props.name.toLowerCase().includes('alaska'));
      });
      
      const hawaiiCounties = data.features.filter(feature => {
        const props = feature.properties || {};
        // Check for Hawaii counties
        return (props.name && 
                (props.name.toLowerCase().includes('hawaii') || 
                 props.name.toLowerCase().includes('honolulu') || 
                 props.name.toLowerCase().includes('maui') || 
                 props.name.toLowerCase().includes('kauai')));
      });
      
      console.log('Found Alaska counties:', alaskaCounties.length);
      console.log('Found Hawaii counties:', hawaiiCounties.length);
      
      // Transform Alaska and Hawaii counties
      const transformedData = transformGeoJSON(data);
      
      setCountiesData(transformedData);
      return transformedData;
    } catch (err) {
      console.error('Error fetching counties data:', err);
      setError('Failed to load counties data. Please try again later.');
      return null;
    } finally {
      setIsLoadingCounties(false);
    }
  };

  return {
    statesData,
    countiesData,
    isLoadingStates,
    isLoadingCounties,
    error,
    fetchCountiesData
  };
};

export default useMapData; 