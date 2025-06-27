import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
// Import TopoJSON data
import statesTopoJSON from '../data/us-states.json';
import countiesTopoJSON from '../data/us-counties.json';
// Import conversion utilities
import { convertTopoToGeoStates, convertTopoToGeoCounties } from '../data/geoUtils';

// Component to handle zoom events and control county visibility
function ZoomHandler({ setShowCounties }) {
  const mapEvents = useMapEvents({
    zoomend: () => {
      const currentZoom = mapEvents.getZoom();
      setShowCounties(currentZoom >= 6);
    }
  });
  
  return null;
}

function MapComponent() {
  const [statesData, setStatesData] = useState(null);
  const [countiesData, setCountiesData] = useState(null);
  const [showCounties, setShowCounties] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Center of contiguous US
  const center = [39.8283, -98.5795];
  const zoom = 4;

  // Style for state boundaries
  const stateStyle = {
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: 0
  };

  // Style for county boundaries
  const countyStyle = {
    color: '#666',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0
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
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#ffffff' }}
        zoomControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        dragging={true}
      >
        {/* Render states GeoJSON */}
        {statesData && (
          <GeoJSON 
            data={statesData} 
            style={stateStyle}
          />
        )}
        
        {/* Render counties GeoJSON only when zoomed in */}
        {showCounties && countiesData && (
          <GeoJSON 
            data={countiesData} 
            style={countyStyle}
          />
        )}
        
        {/* Component to handle zoom events */}
        <ZoomHandler setShowCounties={setShowCounties} />
      </MapContainer>
    </div>
  );
}

export default MapComponent; 