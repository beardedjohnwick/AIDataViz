import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';
import L from 'leaflet';
import * as topojson from 'topojson-client';
import statesData from '../data/us-states.json';
import countiesData from '../data/us-counties.json';
import { geoDataService } from '../data/apiService';
import { 
  transformHawaii, 
  isHawaiiFeature, 
  setHawaiiTransformation, 
  HAWAII_CONFIG, 
  transformAlaska, 
  isAlaskaFeature, 
  setAlaskaTransformation, 
  ALASKA_CONFIG 
} from '../data/geoUtils';

// Component to force re-render of GeoJSON when data changes
const GeoJSONWithUpdates = ({ data, style, zIndex, showCounties }) => {
  const map = useMap();
  const geoJsonLayerRef = useRef(null);
  
  useEffect(() => {
    // Remove previous layer if it exists
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.removeFrom(map);
    }
    
    // Create new layer
    if (data) {
      // Create a style function that adds hover state when counties are not shown
      const styleFunction = (feature) => {
        const baseStyle = typeof style === 'function' ? style(feature) : style;
        return baseStyle;
      };
      
      const layer = L.geoJSON(data, { 
        style: styleFunction,
        onEachFeature: (feature, layer) => {
          // Check if this is a state or county feature
          const isCounty = feature.properties && (feature.properties.GEOID || feature.id && feature.id.toString().length > 2);
          
          // Store the original style to restore it on mouseout
          const originalStyle = {
            fillColor: 'transparent',
            fillOpacity: 0,
            weight: layer.options.weight,
            color: layer.options.color,
            opacity: layer.options.opacity
          };
          
          // Get feature name for tooltip
          const featureName = feature.properties?.name || 
                             (isCounty ? `County ID: ${feature.id}` : `State ID: ${feature.id}`);
          
          // Add tooltip to display feature name
          layer.bindTooltip(
            `<div class="custom-tooltip"><strong>${featureName}</strong></div>`,
            {
              permanent: false,
              direction: 'auto',
              className: isCounty ? 'county-tooltip' : 'state-tooltip',
              sticky: true, // Makes tooltip follow the mouse
              offset: [10, 0] // Small offset from cursor
            }
          );
          
          // Only add hover state to states when counties are not shown
          if (!showCounties && !isCounty) {
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  fillColor: '#cccccc',
                  fillOpacity: 0.5
                });
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(originalStyle);
              }
            });
          }
          // Add hover state to counties when counties are shown
          else if (showCounties && isCounty) {
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                  fillColor: '#cccccc',
                  fillOpacity: 0.5
                });
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  layer.bringToFront();
                }
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(originalStyle);
              }
            });
          }
        }
      });
      
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
  }, [map, data, style, zIndex, showCounties]);
  
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
  
  // Alaska transformation parameters
  const [alaskaScale, setAlaskaScale] = useState(ALASKA_CONFIG.defaults.scale);
  const [alaskaScaleY, setAlaskaScaleY] = useState(ALASKA_CONFIG.defaults.scaleY);
  const [alaskaTranslateX, setAlaskaTranslateX] = useState(ALASKA_CONFIG.defaults.translateX);
  const [alaskaTranslateY, setAlaskaTranslateY] = useState(ALASKA_CONFIG.defaults.translateY);
  
  // State and county data with Hawaii and Alaska transformed
  const [transformedStateData, setTransformedStateData] = useState(null);
  const [transformedCountyData, setTransformedCountyData] = useState(null);
  
  // Ref to store the current transformation parameters
  const hawaiiTransformationRef = useRef({
    scale: hawaiiScale,
    translateX: hawaiiTranslateX,
    translateY: hawaiiTranslateY
  });
  
  // Ref to store the current Alaska transformation parameters
  const alaskaTransformationRef = useRef({
    scale: alaskaScale,
    scaleY: alaskaScaleY,
    translateX: alaskaTranslateX,
    translateY: alaskaTranslateY
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
        hawaiiTransformationRef.current = { scale, translateX, translateY };
        return hawaiiTransformationRef.current;
      },
      getTransformation: () => {
        return hawaiiTransformationRef.current;
      },
      reset: () => {
        setHawaiiScale(HAWAII_CONFIG.defaults.scale);
        setHawaiiTranslateX(HAWAII_CONFIG.defaults.translateX);
        setHawaiiTranslateY(HAWAII_CONFIG.defaults.translateY);
        hawaiiTransformationRef.current = { ...HAWAII_CONFIG.defaults };
        return hawaiiTransformationRef.current;
      }
    };
    
    // Expose the Alaska transformation API to the window object
    window.alaskaTransform = {
      setTransformation: (scale, translateX, translateY, scaleY) => {
        setAlaskaScale(scale);
        setAlaskaTranslateX(translateX);
        setAlaskaTranslateY(translateY);
        setAlaskaScaleY(scaleY || scale);
        
        // Update the ref with current values
        alaskaTransformationRef.current = { 
          scale, 
          translateX, 
          translateY, 
          scaleY: scaleY || scale 
        };
        return alaskaTransformationRef.current;
      },
      getTransformation: () => {
        return alaskaTransformationRef.current;
      },
      reset: () => {
        setAlaskaScale(ALASKA_CONFIG.defaults.scale);
        setAlaskaScaleY(ALASKA_CONFIG.defaults.scaleY);
        setAlaskaTranslateX(ALASKA_CONFIG.defaults.translateX);
        setAlaskaTranslateY(ALASKA_CONFIG.defaults.translateY);
        alaskaTransformationRef.current = { ...ALASKA_CONFIG.defaults };
        return alaskaTransformationRef.current;
      }
    };
  }, []);
  
  // Update Hawaii ref when state changes
  useEffect(() => {
    hawaiiTransformationRef.current = {
      scale: hawaiiScale,
      translateX: hawaiiTranslateX,
      translateY: hawaiiTranslateY
    };
  }, [hawaiiScale, hawaiiTranslateX, hawaiiTranslateY]);
  
  // Update Alaska ref when state changes
  useEffect(() => {
    alaskaTransformationRef.current = {
      scale: alaskaScale,
      scaleY: alaskaScaleY,
      translateX: alaskaTranslateX,
      translateY: alaskaTranslateY
    };
  }, [alaskaScale, alaskaScaleY, alaskaTranslateX, alaskaTranslateY]);

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
  
  // Apply Hawaii and Alaska transformations when data or transformation parameters change
  useEffect(() => {
    if (stateGeoJsonData) {
      // First transform Hawaii in state data
      const hawaiiTransformed = transformHawaii(
        stateGeoJsonData, 
        hawaiiScale, 
        hawaiiTranslateX, 
        hawaiiTranslateY
      );
      
      // Then transform Alaska in the Hawaii-transformed data
      const fullyTransformed = transformAlaska(
        hawaiiTransformed,
        alaskaScale,
        alaskaTranslateX,
        alaskaTranslateY,
        alaskaScaleY
      );
      
      setTransformedStateData(fullyTransformed);
    }
    
    if (countyGeoJsonData) {
      // First transform Hawaii in county data
      const hawaiiTransformed = transformHawaii(
        countyGeoJsonData, 
        hawaiiScale, 
        hawaiiTranslateX, 
        hawaiiTranslateY
      );
      
      // Then transform Alaska in the Hawaii-transformed data
      const fullyTransformed = transformAlaska(
        hawaiiTransformed,
        alaskaScale,
        alaskaTranslateX,
        alaskaTranslateY,
        alaskaScaleY
      );
      
      setTransformedCountyData(fullyTransformed);
    }
  }, [
    stateGeoJsonData, 
    countyGeoJsonData, 
    hawaiiScale, 
    hawaiiTranslateX, 
    hawaiiTranslateY,
    alaskaScale,
    alaskaScaleY,
    alaskaTranslateX,
    alaskaTranslateY
  ]);

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
            showCounties={showCounties}
          />
        )}
        {transformedStateData && (
          <GeoJSONWithUpdates 
            data={transformedStateData} 
            style={stateStyle}
            zIndex={2}
            showCounties={showCounties}
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
      
      {/* Alaska transformation controls - hidden from UI but available for programmatic control */}
      <div className="alaska-controls" style={{ display: 'none' }}>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={alaskaScale}
          onChange={(e) => setAlaskaScale(parseFloat(e.target.value))}
          data-alaska-control="scale"
        />
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={alaskaScaleY}
          onChange={(e) => setAlaskaScaleY(parseFloat(e.target.value))}
          data-alaska-control="scaleY"
        />
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={alaskaTranslateX}
          onChange={(e) => setAlaskaTranslateX(parseFloat(e.target.value))}
          data-alaska-control="translateX"
        />
        <input
          type="range"
          min="-150"
          max="0"
          step="1"
          value={alaskaTranslateY}
          onChange={(e) => setAlaskaTranslateY(parseFloat(e.target.value))}
          data-alaska-control="translateY"
        />
      </div>
    </>
  );
};

export default MapComponent; 