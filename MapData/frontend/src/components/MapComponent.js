import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
// Import TopoJSON data (as fallback)
import statesTopoJSON from '../data/us-states.json';
import countiesTopoJSON from '../data/us-counties.json';
// Import conversion utilities
import { convertTopoToGeoStates, convertTopoToGeoCounties, repositionAlaskaHawaii } from '../data/geoUtils';
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
  const [showAreaInTooltip, setShowAreaInTooltip] = useState(true);
  
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
  
  // Toggle area display in tooltip
  const handleAreaToggle = () => {
    setShowAreaInTooltip(!showAreaInTooltip);
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

  // Define loadStatesData function at component scope so it can be called from anywhere
  const loadStatesData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching states data...');
      
      // First check if API is healthy
      const isApiHealthy = await checkApiHealth();
      
      if (!isApiHealthy) {
        console.warn('API health check failed, falling back to static files');
        throw new Error('API health check failed');
      }
      
      const statesResponse = await geoDataService.getStates(true);
      console.log('States data from API:', statesResponse);
      
      // Validate the GeoJSON data
      if (validateGeoJSON(statesResponse)) {
        console.log('API data is valid GeoJSON, applying Alaska/Hawaii repositioning...');
        
        // Check if Alaska exists in the data
        const alaskaFeature = statesResponse.features.find(feature => {
          const props = feature.properties || {};
          const name = (props.name || props.NAME || '').toLowerCase();
          const fips = props.fips_code || props.STATE || props.STATEFP || '';
          return name === 'alaska' || fips === '02';
        });
        
        console.log('Alaska found in API response before repositioning:', !!alaskaFeature);
        
        // Apply repositionAlaskaHawaii to ensure Alaska and Hawaii are properly positioned
        const repositionedStatesData = repositionAlaskaHawaii(statesResponse);
        console.log('Alaska/Hawaii repositioning complete');
        
        // Verify Alaska is still present after repositioning
        const alaskaAfterRepositioning = repositionedStatesData.features.find(feature => {
          const props = feature.properties || {};
          const name = (props.name || props.NAME || '').toLowerCase();
          const fips = props.fips_code || props.STATE || props.STATEFP || '';
          return name === 'alaska' || fips === '02';
        });
        
        console.log('Alaska found after repositioning:', !!alaskaAfterRepositioning);
        
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
      
      // Apply Alaska/Hawaii repositioning to static data as well
      const repositionedStatesData = repositionAlaskaHawaii(staticStatesData);
      
      // Verify Alaska is present in static data
      const alaskaInStatic = repositionedStatesData.features.find(feature => {
        const props = feature.properties || {};
        const name = (props.name || props.NAME || '').toLowerCase();
        return name === 'alaska';
      });
      
      console.log('Alaska found in static data after repositioning:', !!alaskaInStatic);
      
      setStatesData(repositionedStatesData);
      setUsingApi(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Define loadCountiesData function at component scope so it can be called from anywhere
  const loadCountiesData = useCallback(async () => {
    if (countyToggle && !countiesData && usingApi) {
      try {
        setLoading(true);
        console.log('Fetching counties data after toggle...');
        const countiesResponse = await geoDataService.getCounties(true);
        console.log('Counties data from API after toggle:', countiesResponse);
        
        if (validateGeoJSON(countiesResponse)) {
          // Apply repositionAlaskaHawaii to ensure Alaska and Hawaii counties are properly positioned
          console.log('Repositioning Alaska and Hawaii for counties data after toggle');
          const repositionedCountiesData = repositionAlaskaHawaii(countiesResponse);
          console.log('Counties repositioning complete, features count:', repositionedCountiesData.features.length);
          
          // Check if Hawaii counties exist
          const hawaiiCounties = repositionedCountiesData.features.filter(feature => {
            const props = feature.properties || {};
            const name = (props.name || '').toLowerCase();
            return name.includes('hawaii') || name.includes('honolulu') || 
                   name.includes('maui') || name.includes('kauai');
          });
          
          console.log(`Hawaii counties found after repositioning: ${hawaiiCounties.length}`);
          
          // If no Hawaii counties in the API data, we might need to add them from static data
          if (hawaiiCounties.length === 0) {
            console.log('No Hawaii counties found in API data, checking static data');
            // This could be enhanced to actually add Hawaii counties from static data if needed
          }
          
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
  }, [countyToggle, countiesData, usingApi]);

  // Load data from API or fallback to static files
  useEffect(() => {
    loadStatesData();
  }, [loadStatesData]);

  // Load counties data when toggle is switched on
  useEffect(() => {
    loadCountiesData();
  }, [countyToggle, countiesData, usingApi, loadCountiesData]);

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
        showAreaInTooltip={showAreaInTooltip}
        onAreaToggle={handleAreaToggle}
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
          {statesData && <StateLayers 
            data={statesData} 
            onStateSelected={handleStateSelected}
            showAreaInTooltip={showAreaInTooltip} 
          />}
          
          {/* Render counties using CountyLayers component */}
          {showCounties && countiesData && <CountyLayers 
            data={countiesData} 
            onCountySelected={handleCountySelected}
            showAreaInTooltip={showAreaInTooltip}
          />}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapComponent; 