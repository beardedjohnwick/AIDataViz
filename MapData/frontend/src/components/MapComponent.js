import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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
import { interpretCommand } from '../utils/mockLLM';
import { getHeatmapColor, generateHeatmapLegend } from '../utils/colorUtils';

// Component to handle zooming to a feature when clicked
const ZoomToFeature = ({ featureRef, triggerZoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (featureRef.current) {
      const bounds = featureRef.current.getBounds();
      map.flyToBounds(bounds, {
        padding: [50, 50], // Add some padding around the feature
        duration: 0.8, // Animation duration in seconds
        easeLinearity: 0.5 // Smooth transition
      });
    }
  }, [map, featureRef, triggerZoom]);
  
  return null;
};

// Component to add a reset view button
const ResetViewControl = ({ isZoomed, onResetView }) => {
  const map = useMap();
  
  // Always show the reset button regardless of zoom state
  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button 
          className="reset-view-button" 
          title="Reset View"
          onClick={onResetView}
        >
          Reset View
        </button>
      </div>
    </div>
  );
};

// Component to force re-render of GeoJSON when data changes
const GeoJSONWithUpdates = ({ data, style, zIndex, showCounties, onFeatureSelected }) => {
  const map = useMap();
  const geoJsonLayerRef = useRef(null);
  const selectedFeatureRef = useRef(null);
  const [triggerZoom, setTriggerZoom] = useState(false);
  
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
          
          // Get the current style from the style function to preserve dynamic styling
          const currentStyle = typeof style === 'function' ? style(feature) : style;
          
          // Store the original style to restore it on mouseout
          const originalStyle = {
            fillColor: currentStyle.fillColor || 'transparent',
            fillOpacity: currentStyle.fillOpacity !== undefined ? currentStyle.fillOpacity : 0,
            weight: layer.options.weight,
            color: layer.options.color,
            opacity: layer.options.opacity
          };
          
          // Get feature name for tooltip
          const featureName = feature.properties?.name || 
                             (isCounty ? `County ID: ${feature.id}` : `State ID: ${feature.id}`);
          
          // Only show state tooltips when counties are not shown, or county tooltips when counties are shown
          // When counties are shown, only bind tooltips to county features
          if ((showCounties && isCounty) || (!showCounties && !isCounty)) {
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
          }
          
          // Only add hover state to states when counties are not shown
          if (!showCounties && !isCounty) {
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                // Add a semi-transparent gray overlay that allows the true color to show through
                const currentFillColor = originalStyle.fillColor || 'transparent';
                const currentOpacity = originalStyle.fillOpacity || 0;
                
                layer.setStyle({
                  fillColor: currentFillColor,
                  fillOpacity: currentOpacity + 0.2, // Increase opacity slightly
                  weight: originalStyle.weight + 1, // Make border slightly thicker
                  color: '#555555' // Darker border on hover
                });
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(originalStyle);
              },
              // Add click handler to zoom to feature
              click: (e) => {
                // Prevent default behavior that causes the blue focus box
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                
                // Set the selected feature for zooming
                selectedFeatureRef.current = layer;
                setTriggerZoom(prev => !prev); // Toggle to trigger re-render
                
                // Notify parent that a feature was selected
                if (onFeatureSelected) {
                  onFeatureSelected(true);
                }
              }
            });
          }
          // Add hover state to counties when counties are shown
          else if (showCounties && isCounty) {
            layer.on({
              mouseover: (e) => {
                const layer = e.target;
                // Add a semi-transparent gray overlay that allows the true color to show through
                const currentFillColor = originalStyle.fillColor || 'transparent';
                const currentOpacity = originalStyle.fillOpacity || 0;
                
                layer.setStyle({
                  fillColor: currentFillColor,
                  fillOpacity: currentOpacity + 0.2, // Increase opacity slightly
                  weight: originalStyle.weight + 1, // Make border slightly thicker
                  color: '#555555' // Darker border on hover
                });
                
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  layer.bringToFront();
                }
              },
              mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(originalStyle);
              },
              // Add click handler to zoom to feature
              click: (e) => {
                // Prevent default behavior that causes the blue focus box
                L.DomEvent.preventDefault(e);
                L.DomEvent.stopPropagation(e);
                
                // Set the selected feature for zooming
                selectedFeatureRef.current = layer;
                setTriggerZoom(prev => !prev); // Toggle to trigger re-render
                
                // Notify parent that a feature was selected
                if (onFeatureSelected) {
                  onFeatureSelected(true);
                }
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
  }, [map, data, style, zIndex, showCounties, onFeatureSelected]);
  
  return <ZoomToFeature featureRef={selectedFeatureRef} triggerZoom={triggerZoom} />;
};

/**
 * Leaflet map component that displays US state and county boundaries
 */
const MapComponent = forwardRef(({ showCounties = true }, ref) => {
  const [stateGeoJsonData, setStateGeoJsonData] = useState(null);
  const [countyGeoJsonData, setCountyGeoJsonData] = useState(null);
  const [statesLoading, setStatesLoading] = useState(true);
  const [countiesLoading, setCountiesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const mapRef = useRef(null);
  
  // State variable to store highlighted counties
  // Keys are county FIPS codes, values are fill colors
  const [highlightedCounties, setHighlightedCounties] = useState({});
  
  // State variable to store highlighted states
  // Keys are state FIPS codes, values are fill colors
  const [highlightedStates, setHighlightedStates] = useState({});
  
  // Heat map state variables
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [heatmapType, setHeatmapType] = useState('state'); // 'state' or 'county'
  const [heatmapColorScheme, setHeatmapColorScheme] = useState('blue-red');
  
  // Define map bounds to restrict dragging
  // These bounds restrict primarily the top-left direction while allowing more freedom in other directions
  const maxBounds = [
    [18, -150], // Southwest corner - higher latitude and less negative longitude to restrict top-left
    [55, -50]   // Northeast corner - higher latitude and less negative longitude to allow more freedom in other directions
  ];
  
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

  // Mock data for heat map demonstration
  const mockStateData = {
    '01': 0.67, // Alabama
    '04': 0.89, // Arizona
    '05': 0.45, // Arkansas
    '06': 0.95, // California
    '08': 0.72, // Colorado
    '09': 0.58, // Connecticut
    '10': 0.37, // Delaware
    '12': 0.83, // Florida
    '13': 0.71, // Georgia
    '16': 0.25, // Idaho
    '17': 0.65, // Illinois
    '18': 0.52, // Indiana
    '19': 0.31, // Iowa
    '20': 0.28, // Kansas
    '21': 0.42, // Kentucky
    '22': 0.63, // Louisiana
    '23': 0.15, // Maine
    '24': 0.55, // Maryland
    '25': 0.61, // Massachusetts
    '26': 0.48, // Michigan
    '27': 0.33, // Minnesota
    '28': 0.57, // Mississippi
    '29': 0.44, // Missouri
    '30': 0.12, // Montana
    '31': 0.23, // Nebraska
    '32': 0.78, // Nevada
    '33': 0.21, // New Hampshire
    '34': 0.59, // New Jersey
    '36': 0.76, // New York
    '37': 0.68, // North Carolina
    '38': 0.09, // North Dakota
    '39': 0.54, // Ohio
    '40': 0.47, // Oklahoma
    '41': 0.53, // Oregon
    '42': 0.62, // Pennsylvania
    '44': 0.41, // Rhode Island
    '45': 0.64, // South Carolina
    '46': 0.11, // South Dakota
    '47': 0.56, // Tennessee
    '48': 0.81, // Texas
    '49': 0.43, // Utah
    '50': 0.18, // Vermont
    '51': 0.66, // Virginia
    '53': 0.69, // Washington
    '54': 0.35, // West Virginia
    '55': 0.39, // Wisconsin
    '56': 0.14  // Wyoming
  };
  
  // Mock data for county heat map (just a few counties for demonstration)
  const mockCountyData = {
    '06037': 0.92, // Los Angeles County, CA
    '06075': 0.88, // San Francisco County, CA
    '06085': 0.95, // Santa Clara County, CA
    '17031': 0.78, // Cook County, IL
    '36061': 0.89, // New York County, NY
    '48201': 0.82, // Harris County, TX
    '48113': 0.75, // Dallas County, TX
    '53033': 0.81, // King County, WA
    '06073': 0.86, // San Diego County, CA
    '04013': 0.79, // Maricopa County, AZ
    '48439': 0.73, // Tarrant County, TX
    '06059': 0.84, // Orange County, CA
    '12086': 0.87, // Miami-Dade County, FL
    '48029': 0.71, // Bexar County, TX
    '06065': 0.68, // Riverside County, CA
    '06071': 0.65, // San Bernardino County, CA
    '25017': 0.77, // Middlesex County, MA
    '42101': 0.74, // Philadelphia County, PA
    '12011': 0.80, // Broward County, FL
    '27087': 0.50  // Mahnomen County, MN
  };
  
  // Mock data sets for different data types
  const mockDataSets = {
    // Crime rates data
    crime_rates: {
      state: {
        '06': 0.8, // California
        '48': 0.2, // Texas
        '36': 0.6, // New York
        '12': 0.4, // Florida
        '17': 0.7, // Illinois
        '42': 0.5, // Pennsylvania
        '13': 0.3, // Georgia
        '26': 0.6  // Michigan
      },
      county: {
        '06037': 0.9, // Los Angeles County, CA
        '36061': 0.8, // New York County, NY
        '17031': 0.7, // Cook County, IL
        '48201': 0.3, // Harris County, TX
        '06075': 0.5  // San Francisco County, CA
      }
    },
    // Population data
    population: {
      state: {
        '06': 0.9, // California
        '48': 0.7, // Texas
        '36': 0.8, // New York
        '12': 0.6, // Florida
        '17': 0.5, // Illinois
        '42': 0.4, // Pennsylvania
        '13': 0.6, // Georgia
        '26': 0.3  // Michigan
      },
      county: {
        '06037': 0.8, // Los Angeles County, CA
        '36061': 0.9, // New York County, NY
        '17031': 0.8, // Cook County, IL
        '48201': 0.7, // Harris County, TX
        '06075': 0.6  // San Francisco County, CA
      }
    },
    // Income data
    income: {
      state: {
        '06': 0.7, // California
        '48': 0.4, // Texas
        '36': 0.6, // New York
        '12': 0.3, // Florida
        '17': 0.5, // Illinois
        '42': 0.5, // Pennsylvania
        '13': 0.4, // Georgia
        '26': 0.4  // Michigan
      },
      county: {
        '06037': 0.6, // Los Angeles County, CA
        '36061': 0.9, // New York County, NY
        '17031': 0.7, // Cook County, IL
        '48201': 0.6, // Harris County, TX
        '06075': 0.8  // San Francisco County, CA
      }
    },
    // Unemployment data
    unemployment: {
      state: {
        '06': 0.6, // California
        '48': 0.3, // Texas
        '36': 0.5, // New York
        '12': 0.4, // Florida
        '17': 0.7, // Illinois
        '42': 0.6, // Pennsylvania
        '13': 0.5, // Georgia
        '26': 0.8  // Michigan
      },
      county: {
        '06037': 0.7, // Los Angeles County, CA
        '36061': 0.5, // New York County, NY
        '17031': 0.6, // Cook County, IL
        '48201': 0.4, // Harris County, TX
        '06075': 0.3  // San Francisco County, CA
      }
    }
  };

  // Handle feature selection
  const handleFeatureSelected = (selected) => {
    setIsZoomed(selected);
  };
  
  // Reset view to default
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([37, -98.5795], 5, {
        duration: 0.5,  // Animation duration in seconds
        easeLinearity: 1,  // Smooth easing (lower values = smoother)
        animate: true,  // Ensure animation is enabled
        noMoveStart: true  // Don't fire movestart event
      });
      setIsZoomed(false);
    }
  };
  
  // Component to access the map instance
  const MapController = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
      
      // Make the map instance available globally for debugging
      window.leafletMap = map;
      
      // Helper function to close all tooltips
      const closeAllTooltips = () => {
        map.eachLayer((layer) => {
          if (layer.getTooltip) {
            const tooltip = layer.getTooltip();
            if (tooltip) {
              layer.closeTooltip();
            }
          }
        });
      };
      
      // Only close tooltips when dragging or panning, not on clicks
      map.on('dragstart', closeAllTooltips);
      
      // Add a function to find and zoom to Mahnomen County
      window.findMahnomen = () => {
        if (transformedCountyData) {
          const mahnomenCounty = transformedCountyData.features.find(feature => 
            feature.id === "27087" || 
            (feature.properties && feature.properties.name === "Mahnomen")
          );
          
          if (mahnomenCounty && mahnomenCounty.geometry) {
            console.log("Zooming to Mahnomen County:", mahnomenCounty);
            
            // Create a GeoJSON layer for this county
            const layer = L.geoJSON({
              type: "Feature",
              geometry: mahnomenCounty.geometry,
              properties: mahnomenCounty.properties
            });
            
            // Try to zoom to its bounds
            try {
              const bounds = layer.getBounds();
              console.log("Mahnomen County bounds:", bounds);
              
              // Check if bounds are valid (in Minnesota)
              const center = bounds.getCenter();
              const isInMinnesota = center.lng > -97.5 && center.lng < -89.0 && 
                                   center.lat > 43.0 && center.lat < 49.5;
              
              if (isInMinnesota) {
                map.fitBounds(bounds, {
                  padding: [50, 50],
                  maxZoom: 10
                });
              } else {
                console.log("Mahnomen County bounds not in Minnesota, using fallback");
                // Mahnomen County, MN coordinates (approximate)
                map.setView([47.3252, -95.8020], 10);
              }
            } catch (err) {
              console.error("Error getting bounds for Mahnomen County:", err);
              
              // Fallback: Zoom to Mahnomen County, MN
              map.setView([47.3252, -95.8020], 10);
            }
          } else {
            console.error("Mahnomen County not found in transformed data");
            // Fallback: Zoom to Mahnomen County, MN
            map.setView([47.3252, -95.8020], 10);
          }
        } else {
          // Fallback: Zoom to Mahnomen County, MN
          map.setView([47.3252, -95.8020], 10);
        }
      };
      
      // Expose a function to check the bounds of the map
      window.checkMapBounds = () => {
        const bounds = map.getBounds();
        console.log("Current map bounds:", bounds);
      };
      
    }, [map, transformedCountyData]);
    
    return null;
  };

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
        
        // Debug: Check if Mahnomen County is in the original data
        const mahnomenCounty = geoJson.features.find(feature => 
          feature.id === "27087" || 
          (feature.properties && feature.properties.name === "Mahnomen")
        );
        
        if (mahnomenCounty) {
          console.log("Found Mahnomen County in original data:", mahnomenCounty);
          
          // Validate geometry
          const validateGeometry = (geometry) => {
            if (!geometry) {
              console.error("Mahnomen County has no geometry");
              return false;
            }
            
            if (!geometry.type) {
              console.error("Mahnomen County geometry has no type");
              return false;
            }
            
            if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
              console.error("Mahnomen County has invalid coordinates");
              return false;
            }
            
            // Check if coordinates are valid (not NaN, not empty)
            const checkCoordinates = (coords) => {
              if (!Array.isArray(coords)) return false;
              
              if (coords.length === 0) {
                console.error("Empty coordinates array");
                return false;
              }
              
              if (Array.isArray(coords[0])) {
                // This is an array of coordinates or arrays
                return coords.every(checkCoordinates);
              } else {
                // This is a single coordinate pair
                return coords.length >= 2 && 
                      !isNaN(coords[0]) && 
                      !isNaN(coords[1]);
              }
            };
            
            const valid = checkCoordinates(geometry.coordinates);
            if (!valid) {
              console.error("Mahnomen County has invalid coordinate values");
            }
            return valid;
          };
          
          const isValid = validateGeometry(mahnomenCounty.geometry);
          console.log("Mahnomen County geometry is valid:", isValid);
        } else {
          console.error("Mahnomen County not found in original data");
        }
        
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
        
        // Double check Mahnomen County survived filtering
        const mahnomenAfterFilter = filteredCounties.features.find(feature => 
          feature.id === "27087" || 
          (feature.properties && feature.properties.name === "Mahnomen")
        );
        console.log("Mahnomen County after filtering:", mahnomenAfterFilter ? "Present" : "Missing");
        
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
      
      // Debug: Check if Mahnomen County is in the transformed data
      const mahnomenCounty = fullyTransformed.features.find(feature => 
        feature.id === "27087" || 
        (feature.properties && feature.properties.name === "Mahnomen")
      );
      
      console.log("Mahnomen County in transformed data:", mahnomenCounty ? "Found" : "Not found");
      if (mahnomenCounty) {
        console.log("Mahnomen County details:", mahnomenCounty);
        
        // Check if Mahnomen County needs to be fixed
        // Minnesota's approximate bounding box
        const mnBoundingBox = {
          minLon: -97.5, maxLon: -89.0,
          minLat: 43.0, maxLat: 49.5
        };
        
        // Check if Mahnomen County is outside Minnesota
        let needsFixing = false;
        
        if (mahnomenCounty.geometry && mahnomenCounty.geometry.coordinates) {
          try {
            // For Polygon geometries
            if (mahnomenCounty.geometry.type === 'Polygon' && mahnomenCounty.geometry.coordinates.length > 0) {
              const coords = mahnomenCounty.geometry.coordinates[0];
              // Check if any coordinate is outside Minnesota
              needsFixing = coords.some(coord => {
                const lon = coord[0];
                const lat = coord[1];
                return (lon < mnBoundingBox.minLon || lon > mnBoundingBox.maxLon || 
                        lat < mnBoundingBox.minLat || lat > mnBoundingBox.maxLat);
              });
            }
            // For MultiPolygon geometries
            else if (mahnomenCounty.geometry.type === 'MultiPolygon' && mahnomenCounty.geometry.coordinates.length > 0) {
              needsFixing = mahnomenCounty.geometry.coordinates.some(polygon => {
                if (polygon.length > 0) {
                  const coords = polygon[0];
                  return coords.some(coord => {
                    const lon = coord[0];
                    const lat = coord[1];
                    return (lon < mnBoundingBox.minLon || lon > mnBoundingBox.maxLon || 
                            lat < mnBoundingBox.minLat || lat > mnBoundingBox.maxLat);
                  });
                }
                return false;
              });
            }
          } catch (e) {
            console.warn('Error checking Mahnomen County coordinates:', e);
          }
        }
        
        if (needsFixing) {
          console.log("Mahnomen County is outside Minnesota - fixing position");
          
          // Create a fixed version of the county data with Mahnomen in the right place
          const fixedCountyData = JSON.parse(JSON.stringify(fullyTransformed));
          
          // Find the original Mahnomen County from the untransformed data
          const originalMahnomen = countyGeoJsonData.features.find(feature => 
            feature.id === "27087" || 
            (feature.properties && feature.properties.name === "Mahnomen")
          );
          
          if (originalMahnomen) {
            // Replace the transformed Mahnomen with the original
            const mahnomenIndex = fixedCountyData.features.findIndex(feature => 
              feature.id === "27087" || 
              (feature.properties && feature.properties.name === "Mahnomen")
            );
            
            if (mahnomenIndex >= 0) {
              fixedCountyData.features[mahnomenIndex] = originalMahnomen;
              console.log("Replaced Mahnomen County with original untransformed version");
              
              // Use the fixed data
              setTransformedCountyData(fixedCountyData);
              return;
            }
          }
        }
      }
      
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

  // Define a hardcoded dataset for states with population data
  const stateData = {
    '06': { population: 39000000, color: 'red' },     // California
    '48': { population: 30000000, color: 'blue' },    // Texas
    '12': { population: 22000000, color: 'green' },   // Florida
    '36': { population: 19000000, color: 'orange' },  // New York
    '17': { population: 12500000, color: 'purple' },  // Illinois
    '42': { population: 13000000, color: 'teal' },    // Pennsylvania
    '13': { population: 11000000, color: 'brown' },   // Georgia
    '26': { population: 10000000, color: 'darkgreen' } // Michigan
  };

  /**
   * Applies a heat map visualization to states or counties based on data
   * @param {string} type - Either 'state' or 'county'
   * @param {string} dataType - The type of data to visualize (crime_rates, population, etc.)
   * @param {string} colorScheme - Color scheme to use
   */
  const applyHeatmap = (type = 'state', dataType = 'crime_rates', colorScheme = 'blue-red') => {
    // Get the appropriate data based on type and dataType
    let data;
    
    // Check if we have specific data for this data type
    if (mockDataSets[dataType] && mockDataSets[dataType][type]) {
      data = mockDataSets[dataType][type];
      console.log(`Using ${dataType} data for ${type} heatmap`);
    } else {
      // Fall back to default data if the specific data type isn't available
      data = type === 'state' ? mockStateData : mockCountyData;
      console.log(`No ${dataType} data available, using default data for ${type} heatmap`);
    }
    
    if (!data || Object.keys(data).length === 0) {
      console.error('No data provided for heat map');
      return;
    }
    
    // Find min and max values in the dataset
    const values = Object.values(data);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    console.log(`Applying ${type} heat map with range: ${minValue} to ${maxValue}`);
    
    // Generate colors for each FIPS code
    const colorMap = {};
    Object.entries(data).forEach(([fips, value]) => {
      colorMap[fips] = getHeatmapColor(value, minValue, maxValue, colorScheme);
    });
    
    // Apply the colors to the appropriate state variable
    if (type === 'state') {
      setHighlightedStates(colorMap);
    } else if (type === 'county') {
      setHighlightedCounties(colorMap);
    }
    
    // Update heat map state
    setHeatmapActive(true);
    setHeatmapType(type);
    setHeatmapColorScheme(colorScheme);
    
    // Generate and log the legend (could be displayed in UI later)
    const legend = generateHeatmapLegend(minValue, maxValue, 5, colorScheme);
    console.log('Heat map legend:', legend);
    console.log(`Applied ${dataType} heatmap for ${type} level`);
  };

  /**
   * Clears the current heat map visualization
   */
  const clearHeatmap = () => {
    if (heatmapType === 'state') {
      setHighlightedStates({});
    } else if (heatmapType === 'county') {
      setHighlightedCounties({});
    }
    setHeatmapActive(false);
  };

  // Add a temporary trigger for the heat map in useEffect
  useEffect(() => {
    // This will run once when the component mounts
    const heatmapButton = document.createElement('button');
    heatmapButton.textContent = 'Toggle State Heat Map';
    heatmapButton.className = 'heatmap-toggle-button';
    heatmapButton.style.position = 'absolute';
    heatmapButton.style.top = '10px';
    heatmapButton.style.left = '10px';
    heatmapButton.style.zIndex = '1000';
    heatmapButton.style.padding = '8px 12px';
    heatmapButton.style.backgroundColor = '#fff';
    heatmapButton.style.border = '2px solid #ccc';
    heatmapButton.style.borderRadius = '4px';
    heatmapButton.style.cursor = 'pointer';
    
    heatmapButton.addEventListener('click', () => {
      if (heatmapActive && heatmapType === 'state') {
        clearHeatmap();
      } else {
        applyHeatmap('state');
      }
    });
    
    // Create another button for county heat map
    const countyHeatmapButton = document.createElement('button');
    countyHeatmapButton.textContent = 'Toggle County Heat Map';
    countyHeatmapButton.className = 'county-heatmap-toggle-button';
    countyHeatmapButton.style.position = 'absolute';
    countyHeatmapButton.style.top = '50px';
    countyHeatmapButton.style.left = '10px';
    countyHeatmapButton.style.zIndex = '1000';
    countyHeatmapButton.style.padding = '8px 12px';
    countyHeatmapButton.style.backgroundColor = '#fff';
    countyHeatmapButton.style.border = '2px solid #ccc';
    countyHeatmapButton.style.borderRadius = '4px';
    countyHeatmapButton.style.cursor = 'pointer';
    
    countyHeatmapButton.addEventListener('click', () => {
      if (heatmapActive && heatmapType === 'county') {
        clearHeatmap();
      } else {
        applyHeatmap('county');
      }
    });
    
    // Add buttons to the document body
    document.body.appendChild(heatmapButton);
    document.body.appendChild(countyHeatmapButton);
    
    // Cleanup function to remove buttons when component unmounts
    return () => {
      document.body.removeChild(heatmapButton);
      document.body.removeChild(countyHeatmapButton);
    };
  }, [heatmapActive, heatmapType]);

  // Function to handle map commands from the control panel
  const handleMapCommand = (commandString) => {
    if (!commandString) return;
    
    console.log("Processing command:", commandString);
    
    // Use the mock LLM to interpret the command
    const result = interpretCommand(commandString);
    console.log("Command interpretation:", result);
    
    // Handle the action based on the result from the mock LLM
    switch (result.action) {
      case 'highlightState':
        // Create a new object with the state FIPS code as key and color as value
        setHighlightedStates({ [result.stateFips]: result.color });
        break;
      case 'clearHighlights':
        setHighlightedStates({});
        setHighlightedCounties({});
        setHeatmapActive(false);
        break;
      case 'showHeatmap':
        if (result.mapType === 'state') {
          applyHeatmap('state', 'crime_rates', result.colorScheme || 'blue-red');
        } else if (result.mapType === 'county') {
          applyHeatmap('county', 'crime_rates', result.colorScheme || 'blue-red');
        }
        break;
      case 'heatmap':
        // Use the enhanced heatmap command structure
        applyHeatmap(result.targetType, result.dataType, result.colorScheme);
        break;
      case 'unknown':
      default:
        console.warn("Unknown command:", commandString);
        break;
    }
  };

  // Function to determine state style based on population data
  const getStyleForState = (feature) => {
    // Get the FIPS code from the feature
    const fipsCode = feature.id || 
                    (feature.properties && (feature.properties.fips_code || feature.properties.STATEFP));
    
    // Check if this state exists in our data
    if (fipsCode && stateData[fipsCode]) {
      // Apply highlight style if population is greater than 20 million
      if (stateData[fipsCode].population > 20000000) {
        return {
          color: 'black',
          weight: 1,
          fillColor: stateData[fipsCode].color,
          fillOpacity: 0.7
        };
      }
    }
    
    // Default style for states
    return {
      color: 'black',
      weight: 1,
      fillOpacity: 0
    };
  };

  // Style function for states using our data-driven function
  const stateStyleFunction = (feature) => {
    // Get the FIPS code from the feature
    const fipsCode = feature.id || 
                    (feature.properties && (feature.properties.fips_code || feature.properties.STATEFP));
    
    // Check if this state is highlighted
    if (fipsCode && highlightedStates[fipsCode]) {
      return {
        color: 'black',
        weight: 1,
        fillColor: highlightedStates[fipsCode],
        fillOpacity: 0.7
      };
    }
    
    return {
      color: 'black',
      weight: 1,
      fillOpacity: 0
    };
  };

  // Style for the county borders
  const countyStyle = {
    color: '#444',
    weight: 0.5,
    fillOpacity: 0
  };

  // Style function to highlight counties
  const countyStyleFunction = (feature) => {
    // Get the FIPS code from the feature
    const fipsCode = feature.id || 
                    (feature.properties && (feature.properties.GEOID || feature.properties.fips_code));
    
    // Check if this county is highlighted
    if (fipsCode && highlightedCounties[fipsCode]) {
      return {
        color: '#444',
        weight: 0.5,
        fillColor: highlightedCounties[fipsCode],
        fillOpacity: 0.7
      };
    }
    
    // Check if this is Mahnomen County
    const isMahnomen = feature.id === "27087" || 
                      (feature.properties && feature.properties.name === "Mahnomen");
    
    if (isMahnomen) {
      return {
        color: 'red',
        weight: 2,
        fillColor: 'yellow',
        fillOpacity: 0.3
      };
    }
    
    return countyStyle;
  };

  // Expose methods to parent component through ref
  useImperativeHandle(ref, () => ({
    handleMapCommand,
    applyHeatmap,
    clearHeatmap
  }));

  return (
    <>
      {(statesLoading || countiesLoading) && <div className="map-loading">Loading map data...</div>}
      {error && <div className="map-error">{error}</div>}
      
      <MapContainer 
        center={[37, -98.5795]} // Center of the US, moved higher up
        zoom={5}
        minZoom={5}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0} // Prevents the user from dragging outside bounds (value between 0-1)
        style={{ height: '100vh', width: '100%' }}
        backgroundColor="#ffffff"
      >
        <MapController />
        <TileLayer
          url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
          attribution=""
        />
        {transformedStateData && (
          <GeoJSONWithUpdates 
            data={transformedStateData} 
            style={stateStyleFunction}
            zIndex={1}
            showCounties={showCounties}
            onFeatureSelected={handleFeatureSelected}
          />
        )}
        {showCounties && transformedCountyData && (
          <GeoJSONWithUpdates 
            data={transformedCountyData} 
            style={countyStyleFunction}
            zIndex={2}  // Higher zIndex to ensure county tooltips appear on top
            showCounties={showCounties}
            onFeatureSelected={handleFeatureSelected}
          />
        )}
        <ResetViewControl 
          isZoomed={isZoomed} 
          onResetView={handleResetView} 
        />
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
});

export default MapComponent;