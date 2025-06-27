import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
// Import TopoJSON data (as fallback)
import statesTopoJSON from '../data/us-states.json';
import countiesTopoJSON from '../data/us-counties.json';
// Import conversion utilities
import { convertTopoToGeoStates, convertTopoToGeoCounties } from '../data/geoUtils';
// Import API service
import { geoDataService } from '../data/apiService';
// Import layer components
import StateLayers from './StateLayers';
import CountyLayers from './CountyLayers';
import ControlPanel from './ControlPanel';
import './MapStyles.css';

// Component to handle zoom events
function ZoomHandler({ setZoomLevel }) {
  const mapEvents = useMapEvents({
    zoomend: () => {
      const currentZoom = mapEvents.getZoom();
      setZoomLevel(currentZoom);
    }
  });
  
  return null;
}

// Component to handle map reference and reset view
function MapController({ mapRef, defaultCenter, defaultZoom }) {
  const map = useMapEvents({});
  
  // Store the map reference
  mapRef.current = map;
  
  return null;
}

function MapComponent() {
  const [statesData, setStatesData] = useState(null);
  const [countiesData, setCountiesData] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(4);
  const [countyToggle, setCountyToggle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateSelected, setStateSelected] = useState(false);
  const [selectedStateName, setSelectedStateName] = useState(null);
  const [countySelected, setCountySelected] = useState(false);
  const [selectedCountyName, setSelectedCountyName] = useState(null);
  const [usingApi, setUsingApi] = useState(true);
  
  // Reference to the map instance
  const mapRef = useRef(null);

  // Counties are shown based only on toggle state, not zoom level
  const showCounties = countyToggle;

  // Center of contiguous US
  const center = [37, -98];
  const zoom = 5;

  // Toggle county visibility
  const handleCountyToggle = () => {
    setCountyToggle(!countyToggle);
  };
  
  // Handle state selection
  const handleStateSelected = (selected, stateName) => {
    setStateSelected(selected);
    setSelectedStateName(stateName);
    // Reset county selection when selecting a state
    setCountySelected(false);
    setSelectedCountyName(null);
  };
  
  // Handle county selection
  const handleCountySelected = (selected, countyName) => {
    setCountySelected(selected);
    setSelectedCountyName(countyName);
  };
  
  // Reset map to default view
  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
      setStateSelected(false);
      setSelectedStateName(null);
      setCountySelected(false);
      setSelectedCountyName(null);
    }
  };

  // Function to validate GeoJSON data
  const validateGeoJSON = (data) => {
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
  };

  // Check API health before loading data
  const checkApiHealth = async () => {
    try {
      const isHealthy = await geoDataService.checkHealth();
      return isHealthy;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  };

  // Load data from API or fallback to static files
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First check if API is healthy
        const isApiHealthy = await checkApiHealth();
        
        if (!isApiHealthy) {
          console.warn('API health check failed, falling back to static files');
          throw new Error('API health check failed');
        }
        
        console.log('Attempting to fetch data from API...');
        // Try to fetch data from API
        const statesResponse = await geoDataService.getStates(true);
        console.log('States data from API:', statesResponse);
        
        // Validate the GeoJSON data
        if (validateGeoJSON(statesResponse)) {
          setStatesData(statesResponse);
          
          // Only fetch counties if needed (to save bandwidth)
          if (countyToggle) {
            console.log('Fetching counties data from API...');
            const countiesResponse = await geoDataService.getCounties(true);
            console.log('Counties data from API:', countiesResponse);
            
            if (validateGeoJSON(countiesResponse)) {
              setCountiesData(countiesResponse);
            } else {
              throw new Error('Invalid counties GeoJSON data');
            }
          }
          
          setUsingApi(true);
          setLoading(false);
        } else {
          throw new Error('Invalid states GeoJSON data');
        }
      } catch (apiError) {
        console.warn('Failed to fetch data from API, falling back to static files:', apiError);
        
        try {
          // Fallback to static files
          const statesGeoJSON = convertTopoToGeoStates(statesTopoJSON);
          const countiesGeoJSON = convertTopoToGeoCounties(countiesTopoJSON);
          
          setStatesData(statesGeoJSON);
          setCountiesData(countiesGeoJSON);
          setUsingApi(false);
          setLoading(false);
        } catch (fallbackError) {
          setError('Failed to process map data');
          console.error('Error processing map data:', fallbackError);
          setLoading(false);
        }
      }
    };
    
    loadData();
  }, []); // Only run on mount, not when countyToggle changes

  // Load counties data when toggle is switched on
  useEffect(() => {
    const loadCountiesData = async () => {
      if (countyToggle && !countiesData && usingApi) {
        try {
          setLoading(true);
          console.log('Fetching counties data after toggle...');
          const countiesResponse = await geoDataService.getCounties(true);
          console.log('Counties data from API after toggle:', countiesResponse);
          
          if (validateGeoJSON(countiesResponse)) {
            setCountiesData(countiesResponse);
          } else {
            throw new Error('Invalid counties GeoJSON data');
          }
        } catch (error) {
          console.error('Error fetching counties data:', error);
          
          // Fallback to static files if API fails
          try {
            const countiesGeoJSON = convertTopoToGeoCounties(countiesTopoJSON);
            setCountiesData(countiesGeoJSON);
            setUsingApi(false);
          } catch (fallbackError) {
            setError('Failed to load counties data');
          }
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadCountiesData();
  }, [countyToggle, countiesData, usingApi]);

  if (loading) {
    return <div className="loading-indicator">Loading map data...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      {/* Control panel as a separate panel */}
      <ControlPanel
        countyToggle={countyToggle}
        onCountyToggle={handleCountyToggle}
      />

      {/* Map container */}
      <div className="map-container">
        {/* Reset button - shown when a state or county is selected */}
        {(stateSelected || countySelected) && (
          <div className="reset-button-container">
            <button 
              onClick={resetMapView}
              className="reset-button"
            >
              Reset Map View
            </button>
          </div>
        )}
        
        {/* Data source indicator */}
        <div className="data-source-indicator">
          {usingApi 
            ? 'Using API data (Live database connection)' 
            : 'Using static data with mock area values (API unavailable)'}
        </div>
        
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%', background: '#ffffff' }}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          minZoom={5}
        >
          {/* Zoom handler component */}
          <ZoomHandler setZoomLevel={setZoomLevel} />
          
          {/* Map controller component */}
          <MapController mapRef={mapRef} defaultCenter={center} defaultZoom={zoom} />
          
          {/* Render states using StateLayers component */}
          {statesData && <StateLayers data={statesData} onStateSelected={handleStateSelected} />}
          
          {/* Render counties using CountyLayers component */}
          {showCounties && countiesData && <CountyLayers data={countiesData} onCountySelected={handleCountySelected} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapComponent; 