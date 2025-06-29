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
import { testStatisticsLibrary } from '../utils/statisticsUtils';
import { testAnalyticalRegistry, analyticalFunctionRegistry } from '../utils/analyticalFunctionRegistry';
import { testAnalyticalCommandParsing } from '../utils/mockLLM';

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
      '06': 0.12, '48': 0.08, '36': 0.15, '12': 0.11, '17': 0.09,
      '04': 0.07, '13': 0.14, '26': 0.10, '39': 0.08, '51': 0.06,
      // County data
      '06037': 0.18, '36061': 0.16, '17031': 0.15, '48201': 0.09, '06075': 0.11
    },
    // Population data (in millions)
    population: {
      '06': 39.5, '48': 29.1, '12': 21.5, '36': 19.8, '17': 12.7,
      '39': 11.8, '13': 10.7, '26': 10.0, '04': 7.3, '51': 8.6,
      // County data (in millions)
      '06037': 10.1, '36061': 1.6, '17031': 5.2, '48201': 4.7, '06075': 0.9
    },
    // Income data (median household income in thousands)
    income: {
      '06': 75.2, '36': 68.5, '26': 59.2, '48': 61.9, '12': 55.7,
      '51': 74.2, '17': 65.8, '39': 58.1, '04': 58.9, '13': 58.7,
      // County data (in thousands)
      '06037': 68.3, '36061': 86.5, '17031': 63.2, '48201': 60.7, '06075': 112.4
    },
    // Unemployment data (rate as decimal)
    unemployment: {
      '06': 0.074, '48': 0.063, '36': 0.081, '12': 0.057, '17': 0.069,
      '04': 0.078, '13': 0.052, '26': 0.088, '39': 0.071, '51': 0.045,
      // County data
      '06037': 0.082, '36061': 0.076, '17031': 0.074, '48201': 0.068, '06075': 0.054
    },
    // Land area data (in thousands of square miles)
    land_area: {
      '02': 665.4, // Alaska - largest state
      '48': 268.6, // Texas - second largest
      '06': 163.7, // California
      '30': 147.0, // Montana
      '35': 121.6, // New Mexico
      '04': 113.9, // Arizona
      '38': 70.7,  // North Dakota
      '56': 97.8,  // Wyoming
      '31': 77.4,  // Nebraska
      '39': 44.8   // Ohio
    }
  };

  // Mock historical data for time-series analysis
  const mockHistoricalData = {
    income: {
      // State FIPS -> array of values for [2019, 2020, 2021, 2022, 2023]
      '06': [72.5, 73.1, 74.8, 75.2, 76.1], // California - increasing trend
      '48': [59.8, 60.2, 61.1, 61.9, 62.3], // Texas - increasing trend
      '36': [65.2, 64.8, 66.1, 68.5, 67.9], // New York - mixed trend
      '12': [54.1, 53.8, 54.9, 55.7, 55.2], // Florida - mixed trend
      '17': [63.2, 62.8, 64.1, 65.8, 65.1], // Illinois - mixed trend
      '04': [56.8, 57.2, 58.1, 58.9, 59.4], // Arizona - increasing trend
      '13': [56.1, 55.9, 57.2, 58.7, 58.9], // Georgia - increasing trend
      '26': [57.8, 57.2, 58.4, 59.2, 58.8], // Michigan - mixed trend
      '39': [56.9, 56.5, 57.3, 58.1, 57.8], // Ohio - mixed trend
      '51': [71.8, 72.1, 73.4, 74.2, 74.8]  // Virginia - increasing trend
    },
    crime_rates: {
      // State FIPS -> array of values for [2019, 2020, 2021, 2022, 2023]
      '06': [0.14, 0.13, 0.12, 0.12, 0.11], // California - decreasing trend
      '48': [0.09, 0.08, 0.08, 0.08, 0.07], // Texas - decreasing trend
      '36': [0.16, 0.15, 0.15, 0.15, 0.14], // New York - decreasing trend
      '12': [0.12, 0.11, 0.11, 0.11, 0.10], // Florida - decreasing trend
      '17': [0.10, 0.09, 0.09, 0.09, 0.08], // Illinois - decreasing trend
      '04': [0.08, 0.07, 0.07, 0.07, 0.07], // Arizona - decreasing trend
      '13': [0.15, 0.14, 0.14, 0.14, 0.13], // Georgia - decreasing trend
      '26': [0.11, 0.10, 0.10, 0.10, 0.09], // Michigan - decreasing trend
      '39': [0.09, 0.08, 0.08, 0.08, 0.07], // Ohio - decreasing trend
      '51': [0.07, 0.06, 0.06, 0.06, 0.05]  // Virginia - decreasing trend
    }
  };

  // Function to analyze time trends in data
  const analyzeTimeTrend = (dataArray, trend, timePeriod) => {
    if (!dataArray || dataArray.length < 2) return false;
    
    if (timePeriod.type === 'recent') {
      // Check trend over recent years
      const recentData = dataArray.slice(-timePeriod.years);
      return checkTrendDirection(recentData, trend);
    } else if (timePeriod.type === 'majority') {
      // Check if trend occurred in at least X of the last Y years
      const recentData = dataArray.slice(-timePeriod.years);
      let trendCount = 0;
      
      for (let i = 1; i < recentData.length; i++) {
        const yearOverYear = recentData[i] > recentData[i-1];
        if ((trend === 'increase' && yearOverYear) || 
            (trend === 'decrease' && !yearOverYear)) {
          trendCount++;
        }
      }
      
      return trendCount >= timePeriod.threshold;
    }
    
    return false;
  };

  // Function to check direction of trend
  const checkTrendDirection = (dataArray, expectedTrend) => {
    if (dataArray.length < 2) return false;
    
    const firstValue = dataArray[0];
    const lastValue = dataArray[dataArray.length - 1];
    
    switch (expectedTrend) {
      case 'increase':
        return lastValue > firstValue;
      case 'decrease':
        return lastValue < firstValue;
      case 'stable':
        return Math.abs(lastValue - firstValue) < 0.01; // Small threshold for stability
      default:
        return false;
    }
  };

  // Function to apply multi-condition filters
  const applyMultiFilter = (targetType, conditions, operator = 'and') => {
    const filteredData = {};
    
    console.log('Applying multi-filter with operator:', operator);
    console.log('Conditions:', conditions);
    
    // Separate inclusion and exclusion conditions
    const inclusionConditions = conditions.filter(c => !c.exclude);
    const exclusionConditions = conditions.filter(c => c.exclude);
    
    console.log('Inclusion conditions:', inclusionConditions.length);
    console.log('Exclusion conditions:', exclusionConditions.length);
    
    // Get all possible FIPS codes from the first condition's data
    const firstCondition = inclusionConditions[0] || conditions[0];
    const firstDataSet = firstCondition.type === 'trend' 
      ? mockHistoricalData[firstCondition.dataType] 
      : mockDataSets[firstCondition.dataType];
    
    if (!firstDataSet) {
      console.error(`No data available for data type: ${firstCondition.dataType}`);
      return;
    }
    
    Object.keys(firstDataSet).forEach(fipsCode => {
      // Skip if the FIPS code doesn't match the target type
      const isStateCode = fipsCode.length <= 2;
      const isCountyCode = fipsCode.length > 2;
      
      if ((targetType === 'state' && !isStateCode) || 
          (targetType === 'county' && !isCountyCode)) {
        return;
      }
      
      let meetsInclusionConditions = false;
      let meetsExclusionConditions = false;
      
      // Evaluate inclusion conditions
      if (inclusionConditions.length > 0) {
        const inclusionResults = [];
        
        for (const condition of inclusionConditions) {
          let meetsThisCondition = false;
          
          if (condition.type === 'trend') {
            const historicalData = mockHistoricalData[condition.dataType];
            if (historicalData && historicalData[fipsCode]) {
              meetsThisCondition = analyzeTimeTrend(
                historicalData[fipsCode], 
                condition.trend, 
                condition.timePeriod
              );
            }
          } else if (condition.type === 'value') {
            const data = mockDataSets[condition.dataType];
            if (data && data[fipsCode] !== undefined) {
              const value = data[fipsCode];
              let adjustedConditionValue = condition.condition.value;
              
              // Apply data type-specific adjustments
              if (condition.dataType === 'population') {
                adjustedConditionValue = condition.condition.value / 1000000;
              } else if (condition.dataType === 'income') {
                adjustedConditionValue = condition.condition.value / 1000;
              } else if (condition.dataType === 'land_area') {
                adjustedConditionValue = condition.condition.value / 1000;
              }
              
              switch (condition.condition.operator) {
                case 'gt':
                  meetsThisCondition = value > adjustedConditionValue;
                  break;
                case 'lt':
                  meetsThisCondition = value < adjustedConditionValue;
                  break;
                case 'eq':
                  meetsThisCondition = value === adjustedConditionValue;
                  break;
                case 'gte':
                  meetsThisCondition = value >= adjustedConditionValue;
                  break;
                case 'lte':
                  meetsThisCondition = value <= adjustedConditionValue;
                  break;
              }
            }
          }
          
          inclusionResults.push(meetsThisCondition);
          
          // For OR logic, if any inclusion condition is met, we can break early
          if (operator === 'or' && meetsThisCondition) {
            meetsInclusionConditions = true;
            break;
          }
        }
        
        // For AND logic, all inclusion conditions must be met
        if (operator === 'and' || operator === 'and_not') {
          meetsInclusionConditions = inclusionResults.every(result => result === true);
        }
        // For OR logic, at least one inclusion condition must be met (handled above)
      } else {
        // No inclusion conditions means we start with all items
        meetsInclusionConditions = true;
      }
      
      // Evaluate exclusion conditions
      if (exclusionConditions.length > 0) {
        const exclusionResults = [];
        
        for (const condition of exclusionConditions) {
          let meetsThisCondition = false;
          
          if (condition.type === 'trend') {
            const historicalData = mockHistoricalData[condition.dataType];
            if (historicalData && historicalData[fipsCode]) {
              meetsThisCondition = analyzeTimeTrend(
                historicalData[fipsCode], 
                condition.trend, 
                condition.timePeriod
              );
            }
          } else if (condition.type === 'value') {
            const data = mockDataSets[condition.dataType];
            if (data && data[fipsCode] !== undefined) {
              const value = data[fipsCode];
              let adjustedConditionValue = condition.condition.value;
              
              // Apply data type-specific adjustments
              if (condition.dataType === 'population') {
                adjustedConditionValue = condition.condition.value / 1000000;
              } else if (condition.dataType === 'income') {
                adjustedConditionValue = condition.condition.value / 1000;
              } else if (condition.dataType === 'land_area') {
                adjustedConditionValue = condition.condition.value / 1000;
              }
              
              switch (condition.condition.operator) {
                case 'gt':
                  meetsThisCondition = value > adjustedConditionValue;
                  break;
                case 'lt':
                  meetsThisCondition = value < adjustedConditionValue;
                  break;
                case 'eq':
                  meetsThisCondition = value === adjustedConditionValue;
                  break;
                case 'gte':
                  meetsThisCondition = value >= adjustedConditionValue;
                  break;
                case 'lte':
                  meetsThisCondition = value <= adjustedConditionValue;
                  break;
              }
            }
          }
          
          exclusionResults.push(meetsThisCondition);
        }
        
        // For exclusion, if ANY exclusion condition is met, the item should be excluded
        meetsExclusionConditions = exclusionResults.some(result => result === true);
      }
      
      // Final decision: include if meets inclusion conditions AND does not meet exclusion conditions
      const shouldInclude = meetsInclusionConditions && !meetsExclusionConditions;
      
      if (shouldInclude) {
        filteredData[fipsCode] = 1; // Highlight color
      }
    });
    
    // Apply highlighting
    if (targetType === 'state') {
      setHighlightedStates(filteredData);
    } else {
      setHighlightedCounties(filteredData);
    }
    
    console.log('Multi-filter results:', {
      operator,
      inclusionConditions: inclusionConditions.length,
      exclusionConditions: exclusionConditions.length,
      matchCount: Object.keys(filteredData).length,
      matches: Object.keys(filteredData)
    });
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
   * Applies a heat map visualization to states or counties
   * @param {string} type - The type of geographic unit to visualize ('state' or 'county')
   * @param {string} dataType - The type of data to visualize (crime_rates, population, etc.)
   * @param {string} colorScheme - Color scheme to use
   */
  const applyHeatmap = (type = 'state', dataType = 'crime_rates', colorScheme = 'blue-red') => {
    // Get the appropriate data based on type and dataType
    let data;
    
    // Check if we have data for this data type
    if (mockDataSets[dataType]) {
      // Filter the data based on the type (state or county)
      data = {};
      Object.entries(mockDataSets[dataType]).forEach(([fipsCode, value]) => {
        // State FIPS codes are 2 digits, county FIPS codes are 5 digits
        const isStateCode = fipsCode.length <= 2;
        const isCountyCode = fipsCode.length > 2;
        
        if ((type === 'state' && isStateCode) || (type === 'county' && isCountyCode)) {
          data[fipsCode] = value;
        }
      });
      
      console.log(`Using ${dataType} data for ${type} heatmap`);
    } else {
      console.error(`No data available for data type: ${dataType}`);
      return;
    }
    
    if (!data || Object.keys(data).length === 0) {
      console.error(`No ${type} data available for heat map`);
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

  /**
   * Applies a filter to highlight states or counties based on a condition
   * @param {string} targetType - The type of geographic unit to filter ('state' or 'county')
   * @param {string} dataType - The type of data to filter on
   * @param {Object} condition - The condition to apply
   */
  const applyFilter = (targetType, dataType, condition) => {
    console.log(`Applying filter: ${targetType} with ${dataType} ${condition.operator} ${condition.value} (${condition.originalValue})`);
    
    // Get the data for the specified data type
    const data = mockDataSets[dataType];
    
    if (!data) {
      console.error(`No data available for data type: ${dataType}`);
      return;
    }
    
    // Filter data based on condition
    const filteredData = {};
    Object.entries(data).forEach(([fipsCode, value]) => {
      // Check if the FIPS code matches the target type
      // State FIPS codes are 2 digits, county FIPS codes are 5 digits
      const isStateCode = fipsCode.length <= 2;
      const isCountyCode = fipsCode.length > 2;
      
      // Skip if the FIPS code doesn't match the target type
      if ((targetType === 'state' && !isStateCode) || 
          (targetType === 'county' && !isCountyCode)) {
        return;
      }
      
      // Adjust condition value based on data type
      let adjustedConditionValue = condition.value;
      if (dataType === 'population') {
        // Population data is stored in millions, but user input is in raw numbers
        adjustedConditionValue = condition.value / 1000000;
      } else if (dataType === 'income') {
        // Income data is stored in thousands, but user input is in raw dollars
        adjustedConditionValue = condition.value / 1000;
      }
      
      let meetsCondition = false;
      
      switch (condition.operator) {
        case 'gt':
          meetsCondition = value > adjustedConditionValue;
          break;
        case 'lt':
          meetsCondition = value < adjustedConditionValue;
          break;
        case 'eq':
          meetsCondition = value === adjustedConditionValue;
          break;
        case 'gte':
          meetsCondition = value >= adjustedConditionValue;
          break;
        case 'lte':
          meetsCondition = value <= adjustedConditionValue;
          break;
        default:
          console.warn('Unknown operator:', condition.operator);
      }
      
      if (meetsCondition) {
        filteredData[fipsCode] = '#3388ff'; // Highlight color (blue)
      }
    });
    
    const matchCount = Object.keys(filteredData).length;
    console.log(`Found ${matchCount} ${targetType}s that meet the condition`);
    
    // Add debug logging
    console.log('Filter Debug:', {
      dataType,
      originalValue: condition.value,
      adjustedValue: dataType === 'population' ? condition.value / 1000000 : 
                    dataType === 'income' ? condition.value / 1000 : condition.value,
      operator: condition.operator,
      sampleDataValue: Object.values(data)[0],
      matchCount: Object.keys(filteredData).length
    });
    
    // Apply highlighting to filtered results
    if (targetType === 'state') {
      setHighlightedStates(filteredData);
      if (matchCount === 0) {
        console.warn("No states match the specified condition");
      }
    } else {
      setHighlightedCounties(filteredData);
      if (matchCount === 0) {
        console.warn("No counties match the specified condition");
      }
    }
  };

  // State name mapping for user-friendly console output
  const stateNames = {
    '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
    '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
    '12': 'Florida', '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho',
    '17': 'Illinois', '18': 'Indiana', '19': 'Iowa', '20': 'Kansas',
    '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine', '24': 'Maryland',
    '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota', '28': 'Mississippi',
    '29': 'Missouri', '30': 'Montana', '31': 'Nebraska', '32': 'Nevada',
    '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico', '36': 'New York',
    '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio', '40': 'Oklahoma',
    '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina',
    '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas', '49': 'Utah',
    '50': 'Vermont', '51': 'Virginia', '53': 'Washington', '54': 'West Virginia',
    '55': 'Wisconsin', '56': 'Wyoming'
  };

  // Function to generate color gradients
  const generateColorGradient = (baseColor, intensity) => {
    // intensity should be between 0 and 1, where 1 is darkest
    const colorMap = {
      red: { r: 255, g: 0, b: 0 },
      blue: { r: 0, g: 0, b: 255 },
      green: { r: 0, g: 128, b: 0 },
      yellow: { r: 255, g: 255, b: 0 },
      orange: { r: 255, g: 165, b: 0 },
      purple: { r: 128, g: 0, b: 128 },
      pink: { r: 255, g: 192, b: 203 }
    };
    
    const baseRGB = colorMap[baseColor] || colorMap.blue;
    
    // Create gradient from light to dark
    // Light version: blend with white (255, 255, 255)
    // Dark version: use the base color
    const lightFactor = 1 - intensity; // Higher intensity = less light blending
    
    const r = Math.round(baseRGB.r + (255 - baseRGB.r) * lightFactor);
    const g = Math.round(baseRGB.g + (255 - baseRGB.g) * lightFactor);
    const b = Math.round(baseRGB.b + (255 - baseRGB.b) * lightFactor);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Function to convert RGB to hex for Leaflet
  const rgbToHex = (rgb) => {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgb;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Function to apply ranking queries
  const applyRanking = (targetType, dataType, count, direction, color = 'blue') => {
    console.log('Applying ranking:', { targetType, dataType, count, direction, color });
    
    const data = mockDataSets[dataType];
    
    if (!data) {
      console.error('Data not found for ranking:', dataType);
      return;
    }
    
    // Convert data to array of [fipsCode, value] pairs
    const dataArray = Object.entries(data).map(([fipsCode, value]) => ({
      fipsCode,
      value,
      originalValue: value
    }));
    
    // Filter by target type (state vs county)
    const filteredData = dataArray.filter(item => {
      const isStateCode = item.fipsCode.length <= 2;
      const isCountyCode = item.fipsCode.length > 2;
      
      if (targetType === 'state') {
        return isStateCode;
      } else if (targetType === 'county') {
        return isCountyCode;
      }
      return true; // Default to include all
    });
    
    // Apply data type-specific adjustments for display purposes
    filteredData.forEach(item => {
      if (dataType === 'population') {
        item.displayValue = `${item.value}M`; // Show as millions
      } else if (dataType === 'income') {
        item.displayValue = `$${item.value}k`; // Show as thousands
      } else if (dataType === 'crime_rates') {
        item.displayValue = `${(item.value * 100).toFixed(1)}%`; // Show as percentage
      } else if (dataType === 'unemployment') {
        item.displayValue = `${(item.value * 100).toFixed(1)}%`; // Show as percentage
      } else if (dataType === 'land_area') {
        item.displayValue = `${item.value}k sq mi`; // Show as thousands of square miles
      } else {
        item.displayValue = item.value.toString();
      }
    });
    
    // Sort based on direction
    if (direction === 'desc') {
      filteredData.sort((a, b) => b.value - a.value);
    } else {
      filteredData.sort((a, b) => a.value - b.value);
    }
    
    // Take top N results
    const topResults = filteredData.slice(0, count);
    
    // Create highlighting data with color gradient
    const highlightData = {};
    const minVisibleIntensity = 0.3; // Set to 0.6 for a much less pronounced gradient range
    
    topResults.forEach((item, index) => {
      // Calculate intensity: rank 1 gets highest intensity (darkest), last rank gets lowest intensity (lightest)
      const rawIntensity = 1 - (index / Math.max(1, count - 1)); // Ensure we don't divide by 0
      // Apply minimum visible intensity to make gradient range less pronounced
      const intensity = minVisibleIntensity + (rawIntensity * (1 - minVisibleIntensity));
      const gradientColor = generateColorGradient(color, intensity);
      const hexColor = rgbToHex(gradientColor);
      
      highlightData[item.fipsCode] = {
        color: hexColor,
        intensity: intensity,
        rank: index + 1
      };
    });
    
    // Apply highlighting
    if (targetType === 'state') {
      setHighlightedStates(highlightData);
    } else {
      setHighlightedCounties(highlightData);
    }
    
    // Log results for user feedback
    console.log(`Ranking results (${direction === 'desc' ? 'highest' : 'lowest'} ${dataType}) in ${color} gradient:`);
    topResults.forEach((item, index) => {
      const stateName = stateNames[item.fipsCode] || `State ${item.fipsCode}`;
      const intensity = highlightData[item.fipsCode].intensity;
      console.log(`${index + 1}. ${stateName}: ${item.displayValue} (intensity: ${intensity.toFixed(2)})`);
    });
    
    console.log('Ranking application results:', {
      dataType,
      direction,
      color,
      requestedCount: count,
      actualCount: topResults.length,
      highlightedStates: Object.keys(highlightData),
      topValue: topResults[0]?.displayValue,
      bottomValue: topResults[topResults.length - 1]?.displayValue,
      colorRange: `Light ${color} to Dark ${color}`
    });
  };

  // Function to apply simple highlighting
  const applySimpleHighlight = (targetType, locations, color, isMultiple = false, invalidLocations = []) => {
    console.log('Applying simple highlight:', { targetType, locations, color, isMultiple, invalidLocations });
    
    // Create highlight data for all locations
    const highlightData = {};
    const locationNames = [];
    
    locations.forEach(location => {
      highlightData[location.id] = color;
      locationNames.push(location.name);
    });
    
    // Apply highlighting
    if (targetType === 'state') {
      setHighlightedStates(highlightData);
      
      // Log results
      if (isMultiple) {
        console.log(`Highlighted ${locationNames.length} states in ${color}: ${locationNames.join(', ')}`);
        if (invalidLocations.length > 0) {
          console.warn(`Some locations were not recognized: ${invalidLocations.join(', ')}`);
        }
      } else {
        console.log(`Highlighted ${locationNames[0]} (FIPS: ${locations[0].id}) in ${color}`);
      }
    } else {
      setHighlightedCounties(highlightData);
      console.log(`Highlighted ${locationNames.length} counties in ${color}: ${locationNames.join(', ')}`);
    }
    
    console.log('Simple highlight applied successfully');
  };

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
      case 'filter':
        // Handle the new filter action
        applyFilter(result.targetType, result.dataType, result.condition);
        break;
      case 'multi_filter':
        // Handle the new multi-condition filter action
        applyMultiFilter(result.targetType, result.conditions, result.operator);
        break;
      case 'multi_color_highlight':
        // Handle the new multi-color highlight action
        applyMultiColorHighlight(result.targetType, result.coloredConditions);
        break;
      case 'ranking':
        // Handle the new ranking action
        applyRanking(result.targetType, result.dataType, result.count, result.direction, result.color);
        break;
      case 'comparison':
        // Handle the new comparison action
        applyComparison(result.targetType, result.firstMetric, result.secondMetric, result.operator);
        break;
      case 'simple_highlight':
        // Handle the new simple highlight action
        applySimpleHighlight(result.targetType, result.locations, result.color, result.isMultiple, result.invalidLocations);
        break;
      case 'analytical_filter':
        // Handle the new analytical filter action
        applyAnalyticalFilter(result);
        break;
      case 'clarify':
        // Handle clarification requests
        handleClarification(result);
        break;
      case 'unknown':
      default:
        console.warn("Unknown command:", commandString);
        if (result.suggestions) {
          console.warn("Try commands like:");
          result.suggestions.forEach(suggestion => console.warn(`- '${suggestion}'`));
        }
        break;
    }
  };

  /**
   * Handle clarification responses from the mock LLM
   * @param {Object} clarificationData - The clarification data from the LLM
   */
  const handleClarification = (clarificationData) => {
    console.log('Displaying clarification:', clarificationData);
    
    // Clear any existing highlights
    setHighlightedStates({});
    setHighlightedCounties({});
    
    // Display clarification message and suggestions
    // This could be implemented as a modal, alert, or console message
    // For now, we'll use console output with clear formatting
    
    console.log('\n=== CLARIFICATION NEEDED ===');
    console.log('Message:', clarificationData.message);
    console.log('\nSuggested commands:');
    clarificationData.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. "${suggestion}"`);
    });
    console.log('\nTry typing one of these commands, or be more specific about what you\'re looking for.');
    console.log('============================\n');
    
    // Optional: You could also display this in the UI
    // For example, update a state variable to show clarification in a component
    // setClarificationData(clarificationData);
  };

  // Style function for states using our data-driven function
  const stateStyleFunction = (feature) => {
    // Get the FIPS code from the feature
    const fipsCode = feature.id || 
                    (feature.properties && (feature.properties.fips_code || feature.properties.STATEFP));
    
    // Check if this state is highlighted
    if (fipsCode && highlightedStates[fipsCode]) {
      const highlight = highlightedStates[fipsCode];
      
      // Check if it's the new color object format (from ranking)
      if (highlight.color && typeof highlight.color === 'string') {
        return {
          color: 'black',
          weight: 1,
          fillColor: highlight.color,
          fillOpacity: 0.8
        };
      }
      
      // Handle legacy numeric color values
      if (typeof highlight === 'number') {
        const colorMap = {
          0.9: 'red',
          0.7: 'blue',
          0.5: 'green',
          0.3: 'yellow',
          0.8: 'orange',
          0.6: 'purple', // Overlap color
          0.4: 'pink'
        };
        
        const actualColor = colorMap[highlight];
        if (actualColor) {
          return {
            color: 'black',
            weight: 1,
            fillColor: actualColor,
            fillOpacity: 0.7
          };
        }
      }
      
      // If the color is a string like 'red', 'blue', etc. use it directly
      if (typeof highlight === 'string' && !highlight.startsWith('#')) {
        return {
          color: 'black',
          weight: 1,
          fillColor: highlight,
          fillOpacity: 0.7
        };
      }
      
      // Otherwise, use the color as is (could be a hex value)
      return {
        color: 'black',
        weight: 1,
        fillColor: highlight,
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
      const highlight = highlightedCounties[fipsCode];
      
      // Check if it's the new color object format (from ranking)
      if (highlight.color && typeof highlight.color === 'string') {
        return {
          color: '#444',
          weight: 0.5,
          fillColor: highlight.color,
          fillOpacity: 0.8
        };
      }
      
      // Handle legacy numeric color values
      if (typeof highlight === 'number') {
        const colorMap = {
          0.9: 'red',
          0.7: 'blue',
          0.5: 'green',
          0.3: 'yellow',
          0.8: 'orange',
          0.6: 'purple', // Overlap color
          0.4: 'pink'
        };
        
        const actualColor = colorMap[highlight];
        if (actualColor) {
          return {
            color: '#444',
            weight: 0.5,
            fillColor: actualColor,
            fillOpacity: 0.7
          };
        }
      }
      
      // If the color is a string like 'red', 'blue', etc. use it directly
      if (typeof highlight === 'string' && !highlight.startsWith('#')) {
        return {
          color: '#444',
          weight: 0.5,
          fillColor: highlight,
          fillOpacity: 0.7
        };
      }
      
      // Otherwise, use the color as is (could be a hex value)
      return {
        color: '#444',
        weight: 0.5,
        fillColor: highlight,
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

  // Function to apply multi-color highlighting
  const applyMultiColorHighlight = (targetType, coloredConditions) => {
    console.log('Applying multi-color highlight:', { targetType, coloredConditions });
    
    const coloredData = {};
    const overlappingData = {}; // Track which states meet multiple conditions
    
    // Process each colored condition
    for (const coloredCondition of coloredConditions) {
      const { condition, color } = coloredCondition;
      const conditionResults = {};
      
      if (condition.type === 'trend') {
        // Handle trend conditions
        const historicalData = mockHistoricalData[condition.dataType];
        if (historicalData) {
          Object.keys(historicalData).forEach(fipsCode => {
            if (analyzeTimeTrend(historicalData[fipsCode], condition.trend, condition.timePeriod)) {
              conditionResults[fipsCode] = color;
            }
          });
        }
      } else if (condition.type === 'value') {
        // Handle value conditions
        const data = mockDataSets[condition.dataType];
        if (data) {
          Object.entries(data).forEach(([fipsCode, value]) => {
            let adjustedConditionValue = condition.condition.value;
            
            // Apply data type-specific adjustments
            if (condition.dataType === 'population') {
              adjustedConditionValue = condition.condition.value / 1000000;
            } else if (condition.dataType === 'land_area') {
              adjustedConditionValue = condition.condition.value / 1000; // Convert to thousands
            } else if (condition.dataType === 'income') {
              adjustedConditionValue = condition.condition.value / 1000; // Convert to thousands
            }
            
            let meetsCondition = false;
            switch (condition.condition.operator) {
              case 'gt':
                meetsCondition = value > adjustedConditionValue;
                break;
              case 'lt':
                meetsCondition = value < adjustedConditionValue;
                break;
              case 'eq':
                meetsCondition = value === adjustedConditionValue;
                break;
              case 'gte':
                meetsCondition = value >= adjustedConditionValue;
                break;
              case 'lte':
                meetsCondition = value <= adjustedConditionValue;
                break;
            }
            
            if (meetsCondition) {
              conditionResults[fipsCode] = color;
            }
          });
        }
      }
      
      // Merge results and track overlaps
      Object.entries(conditionResults).forEach(([fipsCode, newColor]) => {
        if (coloredData[fipsCode]) {
          // This state already has a color - it's an overlap
          if (!overlappingData[fipsCode]) {
            overlappingData[fipsCode] = [coloredData[fipsCode]];
          }
          overlappingData[fipsCode].push(newColor);
        } else {
          coloredData[fipsCode] = newColor;
        }
      });
    }
    
    // Create final highlighting data with overlap color
    const finalHighlightData = {};
    const OVERLAP_COLOR = 'purple'; // Distinct color for overlapping states
    
    Object.entries(coloredData).forEach(([fipsCode, color]) => {
      if (overlappingData[fipsCode]) {
        // This state has multiple colors - use overlap color
        finalHighlightData[fipsCode] = OVERLAP_COLOR;
      } else {
        // Single color
        finalHighlightData[fipsCode] = color;
      }
    });
    
    // Convert colors to highlight values for the existing highlighting system
    const highlightData = {};
    Object.entries(finalHighlightData).forEach(([fipsCode, color]) => {
      const colorMap = {
        'red': 0.9,
        'blue': 0.7,
        'green': 0.5,
        'yellow': 0.3,
        'orange': 0.8,
        'purple': 0.6, // Overlap color
        'pink': 0.4
      };
      highlightData[fipsCode] = colorMap[color] || 0.5;
    });
    
    // Apply highlighting using existing system
    if (targetType === 'state') {
      setHighlightedStates(highlightData);
    } else {
      setHighlightedCounties(highlightData);
    }
    
    console.log('Multi-color highlight results:', {
      totalHighlighted: Object.keys(coloredData).length,
      overlapping: Object.keys(overlappingData).length,
      overlapStates: Object.keys(overlappingData),
      colorBreakdown: {
        ...coloredConditions.map(cc => ({
          color: cc.color,
          count: Object.values(finalHighlightData).filter(c => c === cc.color).length
        })),
        overlap: {
          color: OVERLAP_COLOR,
          count: Object.keys(overlappingData).length
        }
      }
    });
    
    // Log detailed overlap information
    if (Object.keys(overlappingData).length > 0) {
      console.log('Overlapping states (shown in purple):', overlappingData);
      Object.entries(overlappingData).forEach(([fipsCode, colors]) => {
        console.log(`State ${fipsCode}: meets conditions for ${colors.join(' + ')} → displayed as ${OVERLAP_COLOR}`);
      });
    } else {
      console.log('No overlapping states found');
    }
  };

  // Expose methods to parent component through ref
  useImperativeHandle(ref, () => ({
    handleMapCommand,
    applyHeatmap,
    clearHeatmap
  }));

  /**
   * Normalize different data types for comparison to ensure fair comparison
   * @param {string} dataType - The data type being normalized
   * @param {number} value - The value to normalize
   * @returns {number} The normalized value (0-100 scale)
   */
  const normalizeDataForComparison = (dataType, value) => {
    // Normalize different data types to comparable scales
    switch (dataType) {
      case 'population':
        // Population is in millions, normalize to 0-100 scale
        return Math.min(100, (value / 40) * 100); // 40M = 100 points
        
      case 'crime_rates':
        // Crime rates are percentages (0-1), convert to 0-100 scale
        return value * 100;
        
      case 'income':
        // Income is in thousands, normalize to 0-100 scale
        return Math.min(100, (value / 100) * 100); // $100k = 100 points
        
      case 'unemployment':
        // Unemployment is percentage (0-1), convert to 0-100 scale
        return value * 100;
        
      case 'land_area':
        // Land area is in thousands of sq miles, normalize to 0-100 scale
        return Math.min(100, (value / 700) * 100); // 700k sq mi = 100 points
        
      default:
        return value;
    }
  };

  /**
   * Apply comparison filtering between two different data types
   * @param {string} targetType - The target type ('state' or 'county')
   * @param {string} firstMetric - The first metric to compare
   * @param {string} secondMetric - The second metric to compare
   * @param {string} operator - The comparison operator ('gt', 'lt', 'eq')
   */
  const applyComparison = (targetType, firstMetric, secondMetric, operator) => {
    console.log('Applying comparison:', { targetType, firstMetric, secondMetric, operator });
    
    const firstData = mockDataSets[firstMetric];
    const secondData = mockDataSets[secondMetric];
    
    if (!firstData || !secondData) {
      console.error('Missing data for comparison:', { firstMetric, secondMetric });
      return;
    }
    
    const comparisonResults = {};
    const detailedResults = {};
    
    // Get all FIPS codes that exist in both datasets
    const commonFips = Object.keys(firstData).filter(fips => secondData[fips] !== undefined);
    
    commonFips.forEach(fipsCode => {
      const firstValue = firstData[fipsCode];
      const secondValue = secondData[fipsCode];
      
      // Normalize values for fair comparison
      const normalizedFirst = normalizeDataForComparison(firstMetric, firstValue);
      const normalizedSecond = normalizeDataForComparison(secondMetric, secondValue);
      
      let meetsComparison = false;
      
      switch (operator) {
        case 'gt':
          meetsComparison = normalizedFirst > normalizedSecond;
          break;
        case 'lt':
          meetsComparison = normalizedFirst < normalizedSecond;
          break;
        case 'eq':
          meetsComparison = Math.abs(normalizedFirst - normalizedSecond) < 1; // Allow small tolerance
          break;
      }
      
      if (meetsComparison) {
        comparisonResults[fipsCode] = 0.8; // Highlight value
      }
      
      // Store detailed results for logging
      detailedResults[fipsCode] = {
        firstValue: firstValue,
        secondValue: secondValue,
        normalizedFirst: normalizedFirst.toFixed(1),
        normalizedSecond: normalizedSecond.toFixed(1),
        meetsComparison: meetsComparison
      };
    });
    
    // Apply highlighting
    if (targetType === 'state') {
      setHighlightedStates(comparisonResults);
    } else {
      setHighlightedCounties(comparisonResults);
    }
    
    // Log results for user feedback
    const operatorText = operator === 'gt' ? 'higher than' : operator === 'lt' ? 'lower than' : 'equal to';
    console.log(`Comparison results (${firstMetric} ${operatorText} ${secondMetric}):`);
    
    Object.entries(detailedResults).forEach(([fipsCode, details]) => {
      const stateName = stateNames[fipsCode] || `State ${fipsCode}`;
      const status = details.meetsComparison ? '✓' : '✗';
      console.log(`${status} ${stateName}: ${firstMetric}=${details.normalizedFirst} vs ${secondMetric}=${details.normalizedSecond}`);
    });
    
    console.log('Comparison application results:', {
      firstMetric,
      secondMetric,
      operator: operatorText,
      totalStates: commonFips.length,
      matchingStates: Object.keys(comparisonResults).length,
      matchingStatesList: Object.keys(comparisonResults)
    });
  };

  // Test function for statistics library integration
  const testStatsIntegration = () => {
    console.log('Testing statistics library integration...');
    testStatisticsLibrary();
  };

  // Analytical Filter Functions
  const applyAnalyticalFilter = (command) => {
    console.log('🔬 Executing analytical filter:', command);
    
    const { functionName, dataTypes, threshold, visualStyle, targetType } = command;
    
    try {
      // Get the appropriate data for analysis
      const analysisData = prepareAnalysisData(dataTypes, targetType);
      if (!analysisData || analysisData.length === 0) {
        console.error('❌ No data available for analysis');
        return;
      }
      
      console.log(`📊 Analyzing ${analysisData.length} ${targetType}s using ${functionName}`);
      
      // Calculate the analytical function for each geographic unit
      const results = calculateAnalyticalResults(analysisData, functionName, dataTypes);
      
      // Filter results based on threshold
      const filteredResults = filterByThreshold(results, threshold);
      
      console.log(`🎯 Found ${filteredResults.length} ${targetType}s meeting criteria`);
      
      // Apply visual highlighting to filtered results
      highlightFilteredResults(filteredResults, visualStyle, targetType);
      
      console.log(`✅ Analytical filter applied: ${filteredResults.length} units highlighted`);
      
    } catch (error) {
      console.error('❌ Error in applyAnalyticalFilter:', error);
    }
  };

  const prepareAnalysisData = (dataTypes, targetType) => {
    console.log(`📊 Preparing analysis data for ${dataTypes.join(', ')} on ${targetType} level`);
    
    // Mock data sets - replace with your actual data source
    // Using FIPS codes that match the state data structure
    const mockDataSets = {
      crime_rates: {
        '06': 0.15, '48': 0.12, '12': 0.10, '36': 0.08, '42': 0.09,
        '17': 0.11, '39': 0.07, '13': 0.13, '37': 0.06, '26': 0.14
      },
      income: {
        '06': 75.2, '48': 59.8, '12': 55.7, '36': 68.3, '42': 61.2,
        '17': 65.9, '39': 56.1, '13': 58.4, '37': 54.6, '26': 57.3
      },
      population: {
        '06': 39.5, '48': 29.1, '12': 21.5, '36': 19.8, '42': 12.8,
        '17': 12.7, '39': 11.7, '13': 10.6, '37': 10.4, '26': 10.0
      },
      unemployment: {
        '06': 0.074, '48': 0.052, '12': 0.048, '36': 0.063, '42': 0.055,
        '17': 0.067, '39': 0.049, '13': 0.041, '37': 0.044, '26': 0.071
      }
    };
    
    // Get all unique geographic units
    const allUnits = new Set();
    dataTypes.forEach(dataType => {
      if (mockDataSets[dataType]) {
        Object.keys(mockDataSets[dataType]).forEach(unit => allUnits.add(unit));
      }
    });
    
    // Prepare analysis data structure
    const analysisData = Array.from(allUnits).map(unit => {
      const unitData = { id: unit };
      dataTypes.forEach(dataType => {
        if (mockDataSets[dataType] && mockDataSets[dataType][unit] !== undefined) {
          unitData[dataType] = mockDataSets[dataType][unit];
        }
      });
      return unitData;
    });
    
    console.log(`✅ Prepared data for ${analysisData.length} units`);
    return analysisData;
  };

  const calculateAnalyticalResults = (analysisData, functionName, dataTypes) => {
    console.log(`🧮 Calculating ${functionName} for each geographic unit`);
    
    const results = analysisData.map(unitData => {
      let calculatedValue;
      
      try {
        switch (functionName) {
          case 'mean':
            const values = dataTypes.map(dt => unitData[dt]).filter(v => v !== undefined);
            calculatedValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
            break;
            
          case 'correlation':
            if (dataTypes.length >= 2) {
              const x = unitData[dataTypes[0]];
              const y = unitData[dataTypes[1]];
              // For individual units, we'll use a mock correlation based on the relationship
              calculatedValue = x && y ? mockCorrelation(x, y) : null;
            }
            break;
            
          case 'sum':
            const sumValues = dataTypes.map(dt => unitData[dt]).filter(v => v !== undefined);
            calculatedValue = sumValues.length > 0 ? sumValues.reduce((a, b) => a + b, 0) : null;
            break;
            
          case 'standardDeviation':
            // For individual units, we'll calculate based on historical variance (mocked)
            const baseValue = unitData[dataTypes[0]];
            calculatedValue = baseValue ? baseValue * 0.15 : null; // Mock std dev as 15% of base value
            break;
            
          default:
            calculatedValue = unitData[dataTypes[0]]; // Default to first data type value
        }
        
        return {
          id: unitData.id,
          value: calculatedValue,
          rawData: unitData
        };
        
      } catch (error) {
        console.error(`❌ Error calculating ${functionName} for ${unitData.id}:`, error);
        return {
          id: unitData.id,
          value: null,
          rawData: unitData
        };
      }
    });
    
    console.log(`✅ Calculated results for ${results.length} units`);
    return results.filter(r => r.value !== null);
  };

  const mockCorrelation = (x, y) => {
    // Simple mock correlation calculation
    // In a real implementation, you'd calculate correlation across multiple data points
    const normalizedX = x / 100; // Normalize to 0-1 range
    const normalizedY = y / 100;
    
    // Mock correlation based on how similar the normalized values are
    const difference = Math.abs(normalizedX - normalizedY);
    const correlation = 1 - (difference * 2); // Convert difference to correlation
    
    return Math.max(-1, Math.min(1, correlation)); // Clamp to [-1, 1] range
  };

  const filterByThreshold = (results, threshold) => {
    console.log(`🎯 Filtering ${results.length} results by threshold:`, threshold);
    
    const filtered = results.filter(result => {
      switch (threshold.operator) {
        case 'gt':
          return result.value > threshold.value;
        case 'lt':
          return result.value < threshold.value;
        case 'eq':
          return Math.abs(result.value - threshold.value) < 0.01; // Allow small floating point differences
        default:
          return false;
      }
    });
    
    console.log(`✅ Filtered to ${filtered.length} results meeting criteria`);
    return filtered;
  };

  const highlightFilteredResults = (filteredResults, visualStyle, targetType) => {
    console.log(`🎨 Highlighting ${filteredResults.length} ${targetType}s in ${visualStyle.color}`);
    
    try {
      // Clear existing highlights first
      clearHighlights();
      
      // Create highlighting objects for the state variables
      const newHighlights = {};
      
      filteredResults.forEach(result => {
        newHighlights[result.id] = visualStyle.color;
      });
      
      // Update the appropriate state variable
      if (targetType === 'county') {
        setHighlightedCounties(newHighlights);
      } else {
        setHighlightedStates(newHighlights);
      }
      
      console.log(`✅ Successfully highlighted ${filteredResults.length} ${targetType}s in ${visualStyle.color}`);
      
    } catch (error) {
      console.error('❌ Error highlighting filtered results:', error);
    }
  };

  const clearHighlights = () => {
    console.log('🧹 Clearing existing highlights...');
    
    // Clear state and county highlights by setting empty objects
    setHighlightedStates({});
    setHighlightedCounties({});
    
    console.log('✅ Cleared all highlights');
  };

  // Test function for analytical registry integration
  const testRegistryIntegration = () => {
    console.log('Testing analytical function registry...');
    const success = testAnalyticalRegistry();
    if (success) {
      console.log('Analytical function registry is ready for use!');
      console.log('Total functions available:', Object.keys(analyticalFunctionRegistry).length);
    } else {
      console.error('Analytical function registry test failed!');
    }
  };

  // Test function for analytical command parsing
  const testAnalyticalParsing = () => {
    console.log('Testing analytical command parsing...');
    testAnalyticalCommandParsing();
  };

  // Test statistics integration on component mount (temporary for verification)
  useEffect(() => {
    // Test statistics integration on component mount
    testStatsIntegration();
    
    // Test registry integration
    testRegistryIntegration();
    
    // Test analytical command parsing
    testAnalyticalParsing();
  }, []);

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