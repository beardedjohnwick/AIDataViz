import { feature } from 'topojson-client';

// Convert TopoJSON to GeoJSON for states
export const convertTopoToGeoStates = (topoData) => {
  if (!topoData) return null;
  const geoJson = feature(topoData, topoData.objects.states);
  
  // Filter out territories, keeping only continental 48 states, Alaska, and Hawaii
  const filteredGeoJson = filterTerritories(geoJson);
  
  // Add mock area_sq_miles data to each state feature when using static data
  filteredGeoJson.features = filteredGeoJson.features.map(feature => {
    // Add area data based on state
    feature.properties.area_sq_miles = getStateAreaData(feature.properties.name);
    return feature;
  });
  
  return repositionAlaskaHawaii(filteredGeoJson);
};

// Convert TopoJSON to GeoJSON for counties
export const convertTopoToGeoCounties = (topoData) => {
  if (!topoData) return null;
  const geoJson = feature(topoData, topoData.objects.counties);
  
  // Filter out territories, keeping only continental 48 states, Alaska, and Hawaii
  const filteredGeoJson = filterTerritories(geoJson);
  
  // Add mock area_sq_miles data to each county feature when using static data
  filteredGeoJson.features = filteredGeoJson.features.map(feature => {
    // Add a placeholder area value for counties
    feature.properties.area_sq_miles = feature.properties.area_sq_miles || 
      Math.round(Math.random() * 2000 + 500); // Random area between 500-2500 sq miles
    return feature;
  });
  
  return repositionAlaskaHawaii(filteredGeoJson);
};

// Function to provide approximate area data for states in square miles
const getStateAreaData = (stateName) => {
  const stateAreas = {
    'Alabama': 52420,
    'Alaska': 665384,
    'Arizona': 113990,
    'Arkansas': 53179,
    'California': 163695,
    'Colorado': 104094,
    'Connecticut': 5543,
    'Delaware': 2489,
    'Florida': 65758,
    'Georgia': 59425,
    'Hawaii': 10932,
    'Idaho': 83569,
    'Illinois': 57914,
    'Indiana': 36420,
    'Iowa': 56273,
    'Kansas': 82278,
    'Kentucky': 40408,
    'Louisiana': 52378,
    'Maine': 35380,
    'Maryland': 12406,
    'Massachusetts': 10554,
    'Michigan': 96714,
    'Minnesota': 86936,
    'Mississippi': 48432,
    'Missouri': 69707,
    'Montana': 147040,
    'Nebraska': 77348,
    'Nevada': 110572,
    'New Hampshire': 9349,
    'New Jersey': 8723,
    'New Mexico': 121590,
    'New York': 54555,
    'North Carolina': 53819,
    'North Dakota': 70698,
    'Ohio': 44826,
    'Oklahoma': 69899,
    'Oregon': 98379,
    'Pennsylvania': 46054,
    'Rhode Island': 1545,
    'South Carolina': 32020,
    'South Dakota': 77116,
    'Tennessee': 42144,
    'Texas': 268596,
    'Utah': 84897,
    'Vermont': 9616,
    'Virginia': 42775,
    'Washington': 71298,
    'West Virginia': 24230,
    'Wisconsin': 65496,
    'Wyoming': 97813,
    'District of Columbia': 68
  };
  
  return stateAreas[stateName] || null;
};

// Filter out territories, keeping only continental 48 states, Alaska, and Hawaii
const filterTerritories = (geoJson) => {
  if (!geoJson || !geoJson.features) return geoJson;
  
  // Deep clone the GeoJSON to avoid mutating the original
  const result = JSON.parse(JSON.stringify(geoJson));
  
  // FIPS codes for Alaska and Hawaii
  const alaskaFips = '02';
  const hawaiiFips = '15';
  
  // FIPS codes for territories to exclude (Puerto Rico, Guam, US Virgin Islands, etc.)
  const territoryFips = ['60', '66', '69', '72', '78', '74'];
  
  // Filter out territories
  result.features = result.features.filter(feature => {
    // Get state FIPS code - ensure we're checking both possible locations and converting to string
    const fips = String(feature.id || (feature.properties && (feature.properties.STATE || feature.properties.STATEFP)));
    
    // Keep if it's not in the territory list (continental 48 + Alaska + Hawaii)
    return !territoryFips.includes(fips);
  });
  
  return result;
};

// Function to reposition Alaska and Hawaii to the southwest of Texas
export const repositionAlaskaHawaii = (geoJson) => {
  if (!geoJson || !geoJson.features) return geoJson;
  
  // Deep clone the GeoJSON to avoid mutating the original
  const result = JSON.parse(JSON.stringify(geoJson));
  
  // Define transformation parameters
  const alaskaFips = '02';
  const hawaiiFips = '15';
  
  // Position southwest of Texas
  const alaskaTransform = {
    scale: 0.35,
    scaleY: 0.5,  // Higher Y-scale to fix vertical compression
    translateX: 45,
    translateY: -30
  };
  
  const hawaiiTransform = {
    scale: 1.0,
    translateX: 158,
    translateY: -18
  };
  
  // Reference point (approximate southwest corner of Texas)
  const texasReference = [-106, 25];
  
  // Process each feature
  result.features = result.features.map(feature => {
    // Get state FIPS code - ensure we're checking both possible locations and converting to string
    const fips = String(feature.id || (feature.properties && (feature.properties.STATE || feature.properties.STATEFP)));
    
    if (fips === alaskaFips) {
      // Transform Alaska
      feature = transformFeature(
        feature, 
        alaskaTransform.scale, 
        texasReference[0] + alaskaTransform.translateX, 
        texasReference[1] + alaskaTransform.translateY,
        alaskaTransform.scaleY
      );
    } else if (fips === hawaiiFips) {
      // Transform Hawaii
      feature = transformFeature(
        feature, 
        hawaiiTransform.scale, 
        texasReference[0] + hawaiiTransform.translateX, 
        texasReference[1] + hawaiiTransform.translateY
      );
    }
    
    return feature;
  });
  
  return result;
};

// Helper function to transform a GeoJSON feature
const transformFeature = (feature, scale, translateX, translateY, scaleY) => {
  if (!feature.geometry) return feature;
  
  // Process different geometry types
  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates = transformPolygon(
      feature.geometry.coordinates, scale, translateX, translateY, scaleY
    );
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates = feature.geometry.coordinates.map(polygon => 
      transformPolygon(polygon, scale, translateX, translateY, scaleY)
    );
  }
  
  return feature;
};

// Transform polygon coordinates
const transformPolygon = (polygon, scale, translateX, translateY, scaleY) => {
  return polygon.map(ring => 
    ring.map(coord => [
      (coord[0] * scale) + translateX,
      (coord[1] * (scaleY || scale)) + translateY
    ])
  );
}; 