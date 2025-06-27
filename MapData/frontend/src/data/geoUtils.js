import { feature } from 'topojson-client';

// Configuration constants for Hawaii transformation
export const HAWAII_CONFIG = {
  // Default transformation values
  defaults: {
    scale: 1.0,
    translateX: 158,
    translateY: -18
  },
  // Reference point (approximate southwest corner of Texas)
  referencePoint: [-106, 25],
  // Hawaii state FIPS code
  stateFips: '15',
  // Hawaii county names
  countyNames: ['honolulu', 'hawaii', 'maui', 'kauai', 'kalawao'],
  // Approximate bounding box for Hawaii
  boundingBox: {
    minLon: -160,
    maxLon: -154,
    minLat: 18,
    maxLat: 23
  }
};

// Configuration constants for Alaska transformation
export const ALASKA_CONFIG = {
  // Default transformation values
  defaults: {
    scale: 0.35,
    scaleY: 0.5,
    translateX: 45,
    translateY: -30  // Moved Alaska north by changing from -100 to -70
  },
  // Reference point (approximate southwest corner of Texas)
  referencePoint: [-106, 25],
  // Alaska state FIPS code
  stateFips: '02',
  // Alaska borough/census area names
  countyNames: ['anchorage', 'juneau', 'fairbanks', 'kenai', 'matanuska', 'kodiak', 'bethel', 'nome', 'sitka', 'valdez'],
  // Approximate bounding box for Alaska
  boundingBox: {
    minLon: -180,
    maxLon: -130,
    minLat: 51,
    maxLat: 72
  }
};

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
    const fips = String(feature.id || (feature.properties && (feature.properties.STATE || feature.properties.STATEFP || feature.properties.fips_code)));
    
    // Keep if it's not in the territory list (continental 48 + Alaska + Hawaii)
    return !territoryFips.includes(fips);
  });
  
  return result;
};

// Function to reposition Alaska and Hawaii to the southwest of Texas
export const repositionAlaskaHawaii = (geoJson) => {
  if (!geoJson || !geoJson.features) {
    console.warn('repositionAlaskaHawaii: Invalid GeoJSON data provided');
    return geoJson;
  }
  
  console.log('Starting repositionAlaskaHawaii function');
  console.log(`Number of features in GeoJSON: ${geoJson.features.length}`);
  
  // Deep clone the GeoJSON to avoid mutating the original
  const result = JSON.parse(JSON.stringify(geoJson));
  
  // Position southwest of Texas
  const alaskaTransform = {
    scale: 0.35,
    scaleY: 0.5,  // Higher Y-scale to fix vertical compression
    translateX: 45,
    translateY: -100
  };
  
  const hawaiiTransform = {
    scale: 1.0,
    translateX: 158,
    translateY: -18
  };
  
  // Reference point (approximate southwest corner of Texas)
  const texasReference = [-106, 25];
  
  // Count transformations for debugging
  let alaskaCount = 0;
  let hawaiiCount = 0;
  
  // Transform each feature
  result.features = result.features.map(feature => {
    // Skip Mahnomen County - ensure it stays in Minnesota
    if (isMahnomenCounty(feature)) {
      console.log("Preserving Mahnomen County position in Minnesota");
      return feature;
    }
    
    // Check all possible locations for state FIPS code and name
    const props = feature.properties || {};
    const name = (props.name || props.NAME || '').toLowerCase();
    const fips = props.fips_code || props.STATE || props.STATEFP || '';
    
    // More comprehensive check for Alaska
    const isAlaska = isAlaskaFeature(feature);
    
    // More comprehensive check for Hawaii
    const isHawaii = name === 'hawaii' || fips === '15';
    
    if (isAlaska) {
      // Transform Alaska
      console.log(`Transforming Alaska feature: ${props.name || props.NAME || 'unnamed feature'}`);
      alaskaCount++;
      feature = transformFeature(
        feature, 
        alaskaTransform.scale, 
        texasReference[0] + alaskaTransform.translateX, 
        texasReference[1] + alaskaTransform.translateY,
        alaskaTransform.scaleY
      );
    } else if (isHawaii) {
      // Transform Hawaii
      console.log(`Transforming Hawaii feature: ${props.name || props.NAME || 'unnamed feature'}`);
      hawaiiCount++;
      feature = transformFeature(
        feature, 
        hawaiiTransform.scale, 
        texasReference[0] + hawaiiTransform.translateX, 
        texasReference[1] + hawaiiTransform.translateY
      );
    }
    
    return feature;
  });
  
  console.log(`Repositioning complete. Transformed ${alaskaCount} Alaska features and ${hawaiiCount} Hawaii features.`);
  
  return result;
};

// Helper function to identify Hawaii features
export const isHawaiiFeature = (feature) => {
  if (!feature || !feature.properties) return false;
  
  // Explicitly exclude Mahnomen County
  if (isMahnomenCounty(feature)) {
    return false;
  }
  
  const props = feature.properties;
  const name = (props.name || props.NAME || '').toLowerCase();
  const fips = String(props.fips_code || props.STATE || props.STATEFP || feature.id || '');
  
  // For counties, check if the first 2 digits of the 5-digit FIPS code match Hawaii's state code
  const countyFips = String(props.GEOID || props.fips_code || feature.id || '');
  const isHawaiiCounty = countyFips.length === 5 && countyFips.substring(0, 2) === HAWAII_CONFIG.stateFips;
  
  // Check for Hawaii in any string property
  const hasHawaiiInProps = Object.entries(props).some(([key, val]) => 
    typeof val === 'string' && val.toLowerCase().includes('hawaii')
  );
  
  // Check for Hawaii's FIPS code in any property
  const hasHawaiiFipsInProps = Object.entries(props).some(([key, val]) => 
    typeof val === 'string' && (val === HAWAII_CONFIG.stateFips || val === `${HAWAII_CONFIG.stateFips}000`)
  );
  
  // Check for Hawaii's abbreviation
  const hasHIInProps = Object.entries(props).some(([key, val]) => 
    typeof val === 'string' && 
    (val.toUpperCase() === 'HI' || key.toLowerCase() === 'abbreviation' && val.toUpperCase() === 'HI')
  );
  
  // Check for known Hawaii county names
  const hasHawaiianCountyName = name && HAWAII_CONFIG.countyNames.some(countyName => name.includes(countyName));
  
  // Check for Hawaii coordinates (approximate bounding box for Hawaii)
  let isInHawaiiRegion = false;
  if (feature.geometry && feature.geometry.coordinates) {
    try {
      const bbox = HAWAII_CONFIG.boundingBox;
      
      // For Polygon geometries
      if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates.length > 0) {
        const coords = feature.geometry.coordinates[0];
        isInHawaiiRegion = coords.some(coord => {
          const lon = coord[0];
          const lat = coord[1];
          return (lon > bbox.minLon && lon < bbox.maxLon && lat > bbox.minLat && lat < bbox.maxLat);
        });
      }
      // For MultiPolygon geometries
      else if (feature.geometry.type === 'MultiPolygon' && feature.geometry.coordinates.length > 0) {
        isInHawaiiRegion = feature.geometry.coordinates.some(polygon => {
          if (polygon.length > 0) {
            const coords = polygon[0];
            return coords.some(coord => {
              const lon = coord[0];
              const lat = coord[1];
              return (lon > bbox.minLon && lon < bbox.maxLon && lat > bbox.minLat && lat < bbox.maxLat);
            });
          }
          return false;
        });
      }
    } catch (e) {
      console.warn('Error checking Hawaii coordinates:', e);
    }
  }
  
  return name === 'hawaii' || 
         fips === HAWAII_CONFIG.stateFips || 
         isHawaiiCounty || 
         hasHawaiiInProps || 
         hasHawaiiFipsInProps || 
         hasHIInProps || 
         hasHawaiianCountyName ||
         isInHawaiiRegion;
};

// Helper function to check if a feature is a duplicate of Hawaii
export const isDuplicateHawaiiFeature = (feature, transformedFeatures) => {
  if (!feature || !feature.properties || !feature.geometry || !transformedFeatures) {
    return false;
  }
  
  // Check if this is a Hawaii feature
  if (!isHawaiiFeature(feature)) {
    return false;
  }
  
  // Get feature properties
  const props = feature.properties || {};
  const name = (props.name || props.NAME || '').toLowerCase();
  const fips = String(props.fips_code || props.STATE || props.STATEFP || feature.id || '');
  
  // Check if this feature has already been transformed
  return transformedFeatures.some(transformedFeature => {
    const transformedProps = transformedFeature.properties || {};
    const transformedName = (transformedProps.name || transformedProps.NAME || '').toLowerCase();
    const transformedFips = String(transformedProps.fips_code || transformedProps.STATE || transformedProps.STATEFP || transformedFeature.id || '');
    
    // Check if names or FIPS codes match
    return (name && transformedName && name === transformedName) || 
           (fips && transformedFips && fips === transformedFips);
  });
};

// Helper function to identify Mahnomen County, Minnesota
export const isMahnomenCounty = (feature) => {
  if (!feature || !feature.properties) return false;
  
  // Check for Mahnomen County by ID or name
  const isMahnomenById = feature.id === "27087";
  const isMahnomenByName = feature.properties.name === "Mahnomen";
  
  return isMahnomenById || isMahnomenByName;
};

// Function to dynamically transform Hawaii's position and scale
export const transformHawaii = (geoJson, scale = HAWAII_CONFIG.defaults.scale, 
                               translateX = HAWAII_CONFIG.defaults.translateX, 
                               translateY = HAWAII_CONFIG.defaults.translateY) => {
  if (!geoJson || !geoJson.features) {
    console.warn('transformHawaii: Invalid GeoJSON data provided');
    return geoJson;
  }
  
  // Deep clone the GeoJSON to avoid mutating the original
  const result = JSON.parse(JSON.stringify(geoJson));
  
  // Count how many features are transformed
  let hawaiiCount = 0;
  
  // Process each feature
  result.features = result.features.map(feature => {
    // Skip Mahnomen County - ensure it stays in Minnesota
    if (isMahnomenCounty(feature)) {
      return feature;
    }
    
    // Check if this is a Hawaii feature
    const isHawaii = isHawaiiFeature(feature);
    
    if (isHawaii) {
      // Transform Hawaii
      hawaiiCount++;
      
      // Apply the transformation
      feature = transformFeature(
        feature, 
        scale, 
        HAWAII_CONFIG.referencePoint[0] + translateX, 
        HAWAII_CONFIG.referencePoint[1] + translateY
      );
    }
    
    return feature;
  });
  
  console.log(`Hawaii transformation complete. Transformed ${hawaiiCount} Hawaii features.`);
  return result;
};

// Utility function to programmatically control Hawaii's transformation
export const setHawaiiTransformation = (scale, translateX, translateY) => {
  // Find the hidden control elements
  const scaleControl = document.querySelector('[data-hawaii-control="scale"]');
  const translateXControl = document.querySelector('[data-hawaii-control="translateX"]');
  const translateYControl = document.querySelector('[data-hawaii-control="translateY"]');
  
  // Update the control values and dispatch change events
  if (scaleControl) {
    scaleControl.value = scale;
    scaleControl.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  if (translateXControl) {
    translateXControl.value = translateX;
    translateXControl.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  if (translateYControl) {
    translateYControl.value = translateY;
    translateYControl.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  return {
    scale,
    translateX,
    translateY
  };
};

// Helper function to transform a GeoJSON feature
const transformFeature = (feature, scale, translateX, translateY, scaleY) => {
  if (!feature.geometry) {
    console.warn('transformFeature: Feature has no geometry');
    return feature;
  }
  
  const effectiveScaleY = scaleY || scale;
  
  // Process different geometry types
  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates = transformPolygon(
      feature.geometry.coordinates, scale, translateX, translateY, effectiveScaleY
    );
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates = feature.geometry.coordinates.map(polygon => 
      transformPolygon(polygon, scale, translateX, translateY, effectiveScaleY)
    );
  }
  
  return feature;
};

// Helper function to transform polygon coordinates
const transformPolygon = (polygon, scale, translateX, translateY, scaleY) => {
  const effectiveScaleY = scaleY || scale;
  
  return polygon.map(ring => {
    return ring.map(coord => {
      return [
        coord[0] * scale + translateX,
        coord[1] * effectiveScaleY + translateY
      ];
    });
  });
};

// Helper function to identify Alaska features
export const isAlaskaFeature = (feature) => {
  if (!feature || !feature.properties) return false;
  
  // Explicitly exclude Mahnomen County
  if (isMahnomenCounty(feature)) {
    return false;
  }
  
  const props = feature.properties;
  const name = (props.name || props.NAME || '').toLowerCase();
  const fips = String(props.fips_code || props.STATE || props.STATEFP || feature.id || '');
  
  // For counties, check if the first 2 digits of the 5-digit FIPS code match Alaska's state code
  const countyFips = String(props.GEOID || props.fips_code || feature.id || '');
  const isAlaskaCounty = countyFips.length === 5 && countyFips.substring(0, 2) === ALASKA_CONFIG.stateFips;
  
  // Check for Alaska in any string property
  const hasAlaskaInProps = Object.entries(props).some(([key, val]) => 
    typeof val === 'string' && val.toLowerCase().includes('alaska')
  );
  
  // Check for Alaska's FIPS code in any property
  const hasAlaskaFipsInProps = Object.entries(props).some(([key, val]) => 
    typeof val === 'string' && (val === ALASKA_CONFIG.stateFips || val === `${ALASKA_CONFIG.stateFips}000`)
  );
  
  // Check for Alaska's abbreviation
  const hasAKInProps = Object.entries(props).some(([key, val]) => 
    typeof val === 'string' && 
    (val.toUpperCase() === 'AK' || key.toLowerCase() === 'abbreviation' && val.toUpperCase() === 'AK')
  );
  
  // Check for known Alaska county/borough names
  const hasAlaskaCountyName = name && ALASKA_CONFIG.countyNames.some(countyName => name.includes(countyName));
  
  // Check for Alaska coordinates (approximate bounding box for Alaska)
  let isInAlaskaRegion = false;
  if (feature.geometry && feature.geometry.coordinates) {
    try {
      const bbox = ALASKA_CONFIG.boundingBox;
      
      // For Polygon geometries
      if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates.length > 0) {
        const coords = feature.geometry.coordinates[0];
        isInAlaskaRegion = coords.some(coord => {
          const lon = coord[0];
          const lat = coord[1];
          return (lon > bbox.minLon && lon < bbox.maxLon && lat > bbox.minLat && lat < bbox.maxLat);
        });
      }
      // For MultiPolygon geometries
      else if (feature.geometry.type === 'MultiPolygon' && feature.geometry.coordinates.length > 0) {
        isInAlaskaRegion = feature.geometry.coordinates.some(polygon => {
          if (polygon.length > 0) {
            const coords = polygon[0];
            return coords.some(coord => {
              const lon = coord[0];
              const lat = coord[1];
              return (lon > bbox.minLon && lon < bbox.maxLon && lat > bbox.minLat && lat < bbox.maxLat);
            });
          }
          return false;
        });
      }
    } catch (e) {
      console.warn('Error checking Alaska coordinates:', e);
    }
  }
  
  return name === 'alaska' || 
         fips === ALASKA_CONFIG.stateFips || 
         isAlaskaCounty || 
         hasAlaskaInProps || 
         hasAlaskaFipsInProps || 
         hasAKInProps || 
         hasAlaskaCountyName ||
         isInAlaskaRegion;
};

// Helper function to check if a feature is a duplicate of Alaska
export const isDuplicateAlaskaFeature = (feature, transformedFeatures) => {
  if (!feature || !feature.properties || !feature.geometry || !transformedFeatures) {
    return false;
  }
  
  // Check if this is an Alaska feature
  if (!isAlaskaFeature(feature)) {
    return false;
  }
  
  // Get feature properties
  const props = feature.properties || {};
  const name = (props.name || props.NAME || '').toLowerCase();
  const fips = String(props.fips_code || props.STATE || props.STATEFP || feature.id || '');
  
  // Check if this feature has already been transformed
  return transformedFeatures.some(transformedFeature => {
    const transformedProps = transformedFeature.properties || {};
    const transformedName = (transformedProps.name || transformedProps.NAME || '').toLowerCase();
    const transformedFips = String(transformedProps.fips_code || transformedProps.STATE || transformedProps.STATEFP || transformedFeature.id || '');
    
    // Check if names or FIPS codes match
    return (name && transformedName && name === transformedName) || 
           (fips && transformedFips && fips === transformedFips);
  });
};

// Function to dynamically transform Alaska's position and scale
export const transformAlaska = (geoJson, scale = ALASKA_CONFIG.defaults.scale, 
                               translateX = ALASKA_CONFIG.defaults.translateX, 
                               translateY = ALASKA_CONFIG.defaults.translateY,
                               scaleY = ALASKA_CONFIG.defaults.scaleY) => {
  if (!geoJson || !geoJson.features) {
    console.warn('transformAlaska: Invalid GeoJSON data provided');
    return geoJson;
  }
  
  // Deep clone the GeoJSON to avoid mutating the original
  const result = JSON.parse(JSON.stringify(geoJson));
  
  // Count how many features are transformed
  let alaskaCount = 0;
  
  // Process each feature
  result.features = result.features.map(feature => {
    // Skip Mahnomen County - ensure it stays in Minnesota
    if (isMahnomenCounty(feature)) {
      return feature;
    }
    
    // Check if this is an Alaska feature
    const isAlaska = isAlaskaFeature(feature);
    
    if (isAlaska) {
      // Transform Alaska
      alaskaCount++;
      
      // Apply the transformation
      feature = transformFeature(
        feature, 
        scale, 
        ALASKA_CONFIG.referencePoint[0] + translateX, 
        ALASKA_CONFIG.referencePoint[1] + translateY,
        scaleY
      );
    }
    
    return feature;
  });
  
  console.log(`Alaska transformation complete. Transformed ${alaskaCount} Alaska features.`);
  return result;
};

// Utility function to programmatically control Alaska's transformation
export const setAlaskaTransformation = (scale, translateX, translateY, scaleY) => {
  // Find the hidden control elements
  const scaleControl = document.querySelector('[data-alaska-control="scale"]');
  const translateXControl = document.querySelector('[data-alaska-control="translateX"]');
  const translateYControl = document.querySelector('[data-alaska-control="translateY"]');
  const scaleYControl = document.querySelector('[data-alaska-control="scaleY"]');
  
  // Update the control values and dispatch change events
  if (scaleControl) {
    scaleControl.value = scale;
    scaleControl.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  if (translateXControl) {
    translateXControl.value = translateX;
    translateXControl.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  if (translateYControl) {
    translateYControl.value = translateY;
    translateYControl.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  if (scaleYControl) {
    scaleYControl.value = scaleY;
    scaleYControl.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  return {
    scale,
    translateX,
    translateY,
    scaleY
  };
}; 