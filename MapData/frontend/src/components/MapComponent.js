import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
// Import TopoJSON data
import statesTopoJSON from '../data/us-states.json';
import countiesTopoJSON from '../data/us-counties.json';
// Import conversion utilities
import { convertTopoToGeoStates, convertTopoToGeoCounties } from '../data/geoUtils';
// Import layer components
import StateLayers from './StateLayers';
import CountyLayers from './CountyLayers';

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

  useEffect(() => {
    try {
      // Convert TopoJSON to GeoJSON
      const statesGeoJSON = convertTopoToGeoStates(statesTopoJSON);
      const countiesGeoJSON = convertTopoToGeoCounties(countiesTopoJSON);
      
      setStatesData(statesGeoJSON);
      setCountiesData(countiesGeoJSON);
      setLoading(false);
    } catch (err) {
      setError('Failed to process map data');
      console.error('Error processing map data:', err);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Loading map data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Control panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            <input 
              type="checkbox" 
              checked={countyToggle} 
              onChange={handleCountyToggle} 
            />
            {' '}Show County Lines
          </label>
        </div>
        
        {/* Reset button - shown when a state or county is selected */}
        {(stateSelected || countySelected) && (
          <button 
            onClick={resetMapView}
            style={{
              padding: '5px 10px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'block',
              width: '100%'
            }}
          >
            Reset Map View
          </button>
        )}
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
        {/* Render states using StateLayers component */}
        {statesData && <StateLayers data={statesData} onStateSelected={handleStateSelected} />}
        
        {/* Render counties using CountyLayers component */}
        {showCounties && countiesData && <CountyLayers data={countiesData} onCountySelected={handleCountySelected} />}
        
        {/* Component to handle zoom events */}
        <ZoomHandler setZoomLevel={setZoomLevel} />
        
        {/* Component to handle map reference */}
        <MapController mapRef={mapRef} defaultCenter={center} defaultZoom={zoom} />
      </MapContainer>
    </div>
  );
}

export default MapComponent; 