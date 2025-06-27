import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';
import L from 'leaflet';
import * as topojson from 'topojson-client';
import statesData from '../data/us-states.json';
import countiesData from '../data/us-counties.json';
import { geoDataService } from '../data/apiService';
import { transformHawaii, isHawaiiFeature, setHawaiiTransformation, HAWAII_CONFIG } from '../data/geoUtils';

// Component to force re-render of GeoJSON when data changes
const GeoJSONWithUpdates = ({ data, style, zIndex }) => {
  const map = useMap();
  const geoJsonLayerRef = useRef(null);
  
  useEffect(() => {
    // Remove previous layer if it exists
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.removeFrom(map);
    }
    
    // Create new layer
    if (data) {
      const layer = L.geoJSON(data, { style });
      layer.setZIndex(zIndex || 1);
      layer.addTo(map);
      geoJsonLayerRef.current = layer;
    }
    
    // Cleanup on unmount
    return () => {
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.removeFrom(map);
      }
    };
  }, [map, data, style, zIndex]);
  
  return null;
};

/**
 * Leaflet map component that displays US state and county boundaries
 */
const MapComponent = ({ showCounties = true }) => {
  const [stateGeoJsonData, setStateGeoJsonData] = useState(null);
  const [countyGeoJsonData, setCountyGeoJsonData] = useState(null);
  const [statesLoading, setStatesLoading] = useState(true);
  const [countiesLoading, setCountiesLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Hawaii transformation parameters
  const [hawaiiScale, setHawaiiScale] = useState(HAWAII_CONFIG.defaults.scale);
  const [hawaiiTranslateX, setHawaiiTranslateX] = useState(HAWAII_CONFIG.defaults.translateX);
  const [hawaiiTranslateY, setHawaiiTranslateY] = useState(HAWAII_CONFIG.defaults.translateY);
  
  // State and county data with Hawaii transformed
  const [transformedStateData, setTransformedStateData] = useState(null);
  const [transformedCountyData, setTransformedCountyData] = useState(null);
  
  // Ref to store the current transformation parameters
  const transformationRef = useRef({
    scale: hawaiiScale,
    translateX: hawaiiTranslateX,
    translateY: hawaiiTranslateY
  });

  // Fix Leaflet's icon paths which can cause issues in React
  useEffect(() => {
    // Fix Leaflet default icon issue in React
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
    
    // Expose the Hawaii transformation API to the window object
    window.hawaiiTransform = {
      setTransformation: (scale, translateX, translateY) => {
        setHawaiiScale(scale);
        setHawaiiTranslateX(translateX);
        setHawaiiTranslateY(translateY);
        
        // Update the ref with current values
        transformationRef.current = { scale, translateX, translateY };
        return transformationRef.current;
      },
      getTransformation: () => {
        return transformationRef.current;
      },
      reset: () => {
        setHawaiiScale(HAWAII_CONFIG.defaults.scale);
        setHawaiiTranslateX(HAWAII_CONFIG.defaults.translateX);
        setHawaiiTranslateY(HAWAII_CONFIG.defaults.translateY);
        transformationRef.current = { ...HAWAII_CONFIG.defaults };
        return transformationRef.current;
      }
    };
  }, []);
  
  // Update ref when state changes
  useEffect(() => {
    transformationRef.current = {
      scale: hawaiiScale,
      translateX: hawaiiTranslateX,
      translateY: hawaiiTranslateY
    };
  }, [hawaiiScale, hawaiiTranslateX, hawaiiTranslateY]);

  // Filter function to keep only continental US, Alaska, Hawaii, and DC
  // Territories to exclude: Puerto Rico (72), American Samoa (60), Guam (66),
  // US Virgin Islands (78), Northern Mariana Islands (69)
  const filterUSStates = (geoJson) => {
    if (!geoJson || !geoJson.features) return geoJson;
    
    const territoryFipsCodes = ['60', '66', '69', '72', '78'];
    
    const filteredFeatures = geoJson.features.filter(feature => {
      // Get FIPS code from feature properties
      const fipsCode = feature.id || 
                       (feature.properties && (feature.properties.fips_code || feature.properties.STATEFP));
      
      // Keep feature if it's not in the territory FIPS codes list
      return !territoryFipsCodes.includes(fipsCode);
    });
    
    return {
      ...geoJson,
      features: filteredFeatures
    };
  };

  // Convert TopoJSON to GeoJSON on component mount for states
  useEffect(() => {
    try {
      // Check if statesData is a valid TopoJSON
      if (statesData && statesData.type === 'Topology' && statesData.objects && statesData.objects.states) {
        // Convert TopoJSON to GeoJSON using the 'states' object
        const geoJson = topojson.feature(statesData, statesData.objects.states);
        
        // Filter out territories
        const filteredGeoJson = filterUSStates(geoJson);
        
        setStateGeoJsonData(filteredGeoJson);
        setStatesLoading(false);
      } else {
        setError('Invalid TopoJSON data format or missing states object');
        setStatesLoading(false);
      }
    } catch (err) {
      console.error('Error converting TopoJSON to GeoJSON for states:', err);
      setError(`Error processing state map data: ${err.message}`);
      setStatesLoading(false);
    }
  }, []);

  // Convert TopoJSON to GeoJSON on component mount for counties
  useEffect(() => {
    try {
      // Check if countiesData is a valid TopoJSON
      if (countiesData && countiesData.type === 'Topology' && countiesData.objects && countiesData.objects.counties) {
        // Convert TopoJSON to GeoJSON using the 'counties' object
        const geoJson = topojson.feature(countiesData, countiesData.objects.counties);
        
        // Filter counties to match the filtered states
        // Counties have 5-digit FIPS codes where first 2 digits are the state FIPS
        const territoryStateFips = ['60', '66', '69', '72', '78'];
        const filteredCounties = {
          ...geoJson,
          features: geoJson.features.filter(feature => {
            const countyFips = feature.id || 
                              (feature.properties && (feature.properties.fips_code || feature.properties.GEOID));
            // Keep county if its state FIPS (first 2 digits) is not in the territory list
            return countyFips && !territoryStateFips.includes(countyFips.substring(0, 2));
          })
        };
        
        setCountyGeoJsonData(filteredCounties);
        setCountiesLoading(false);
      } else {
        setError('Invalid TopoJSON data format or missing counties object');
        setCountiesLoading(false);
      }
    } catch (err) {
      console.error('Error converting TopoJSON to GeoJSON for counties:', err);
      setError(`Error processing county map data: ${err.message}`);
      setCountiesLoading(false);
    }
  }, []);
  
  // Apply Hawaii transformations when data or transformation parameters change
  useEffect(() => {
    if (stateGeoJsonData) {
      // Transform Hawaii in state data
      const transformedStates = transformHawaii(
        stateGeoJsonData, 
        hawaiiScale, 
        hawaiiTranslateX, 
        hawaiiTranslateY
      );
      setTransformedStateData(transformedStates);
    }
    
    if (countyGeoJsonData) {
      // Transform Hawaii in county data
      const transformedCounties = transformHawaii(
        countyGeoJsonData, 
        hawaiiScale, 
        hawaiiTranslateX, 
        hawaiiTranslateY
      );
      setTransformedCountyData(transformedCounties);
    }
  }, [stateGeoJsonData, countyGeoJsonData, hawaiiScale, hawaiiTranslateX, hawaiiTranslateY]);

  // Style for the state borders
  const stateStyle = {
    color: 'black',
    weight: 1,
    fillOpacity: 0
  };

  // Style for the county borders
  const countyStyle = {
    color: '#444',
    weight: 0.5,
    fillOpacity: 0
  };

  return (
    <>
      {(statesLoading || countiesLoading) && <div className="map-loading">Loading map data...</div>}
      {error && <div className="map-error">{error}</div>}
      
      <MapContainer 
        center={[39.8283, -98.5795]} // Center of the US
        zoom={4}
        style={{ height: '100vh', width: '100%' }}
        backgroundColor="#ffffff"
      >
        <TileLayer
          url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
          attribution=""
        />
        {showCounties && transformedCountyData && (
          <GeoJSONWithUpdates 
            data={transformedCountyData} 
            style={countyStyle}
            zIndex={1}
          />
        )}
        {transformedStateData && (
          <GeoJSONWithUpdates 
            data={transformedStateData} 
            style={stateStyle}
            zIndex={2}
          />
        )}
      </MapContainer>
      
      {/* Hawaii transformation controls - hidden from UI but available for programmatic control */}
      <div className="hawaii-controls" style={{ display: 'none' }}>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={hawaiiScale}
          onChange={(e) => setHawaiiScale(parseFloat(e.target.value))}
          data-hawaii-control="scale"
        />
        <input
          type="range"
          min="100"
          max="250"
          step="1"
          value={hawaiiTranslateX}
          onChange={(e) => setHawaiiTranslateX(parseFloat(e.target.value))}
          data-hawaii-control="translateX"
        />
        <input
          type="range"
          min="-50"
          max="50"
          step="1"
          value={hawaiiTranslateY}
          onChange={(e) => setHawaiiTranslateY(parseFloat(e.target.value))}
          data-hawaii-control="translateY"
        />
      </div>
    </>
  );
};

export default MapComponent; 