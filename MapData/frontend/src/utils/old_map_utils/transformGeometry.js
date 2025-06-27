/**
 * Utility functions for transforming geographic data
 * Specifically for repositioning and scaling Alaska and Hawaii
 */

// Constants for transformations
const ALASKA = {
  FIPS_CODE: '02',
  SCALE: 0.35,
  TRANSLATION: [-1600, 500]  // Adjusted [x, y] offset in pixels
};

const HAWAII = {
  FIPS_CODE: '15',
  SCALE: 0.6,
  TRANSLATION: [-1100, 350]  // Adjusted [x, y] offset in pixels
};

/**
 * Transforms coordinates for Alaska or Hawaii
 * @param {Array} coordinates - GeoJSON coordinates to transform
 * @param {Object} transformConfig - Configuration object with scale and translation
 * @returns {Array} - Transformed coordinates
 */
const transformCoordinates = (coordinates, transformConfig) => {
  const { SCALE, TRANSLATION } = transformConfig;
  
  // Helper function to transform a single point
  const transformPoint = (point) => {
    return [
      point[0] * SCALE + TRANSLATION[0],
      point[1] * SCALE + TRANSLATION[1]
    ];
  };
  
  // Handle different GeoJSON geometry types
  if (!Array.isArray(coordinates)) {
    console.warn('Unexpected non-array coordinates:', coordinates);
    return coordinates;
  }
  
  // Point
  if (!Array.isArray(coordinates[0])) {
    return transformPoint(coordinates);
  }
  
  // LineString or Polygon ring
  if (!Array.isArray(coordinates[0][0])) {
    return coordinates.map(point => transformPoint(point));
  }
  
  // Polygon or MultiLineString
  if (!Array.isArray(coordinates[0][0][0])) {
    return coordinates.map(line => line.map(point => transformPoint(point)));
  }
  
  // MultiPolygon
  return coordinates.map(polygon => 
    polygon.map(ring => ring.map(point => transformPoint(point)))
  );
};

/**
 * Transforms GeoJSON feature geometry for Alaska or Hawaii
 * @param {Object} feature - GeoJSON feature to transform
 * @returns {Object} - Transformed feature
 */
export const transformFeature = (feature) => {
  // Create a deep copy of the feature to avoid mutating the original
  const transformedFeature = JSON.parse(JSON.stringify(feature));
  const { properties, geometry } = transformedFeature;
  
  // Check if this is Alaska or Hawaii
  if (!properties || !geometry) {
    return transformedFeature;
  }
  
  // Check multiple property fields to identify Alaska or Hawaii
  const isAlaska = 
    properties.fips_code === ALASKA.FIPS_CODE || 
    properties.STATEFP === ALASKA.FIPS_CODE || 
    properties.STATE === ALASKA.FIPS_CODE ||
    (properties.name && properties.name.toLowerCase() === 'alaska') ||
    (properties.NAME && properties.NAME.toLowerCase() === 'alaska');
  
  const isHawaii = 
    properties.fips_code === HAWAII.FIPS_CODE || 
    properties.STATEFP === HAWAII.FIPS_CODE || 
    properties.STATE === HAWAII.FIPS_CODE ||
    (properties.name && properties.name.toLowerCase() === 'hawaii') ||
    (properties.NAME && properties.NAME.toLowerCase() === 'hawaii');
  
  if (isAlaska) {
    console.log('Transforming Alaska geometry:', properties.name || properties.NAME);
    console.log('Alaska geometry type:', geometry.type);
    
    try {
      transformedFeature.geometry.coordinates = transformCoordinates(
        geometry.coordinates,
        ALASKA
      );
      console.log('Alaska transformation completed successfully');
    } catch (error) {
      console.error('Error transforming Alaska:', error);
    }
  } else if (isHawaii) {
    console.log('Transforming Hawaii geometry:', properties.name || properties.NAME);
    console.log('Hawaii geometry type:', geometry.type);
    
    try {
      transformedFeature.geometry.coordinates = transformCoordinates(
        geometry.coordinates,
        HAWAII
      );
      console.log('Hawaii transformation completed successfully');
    } catch (error) {
      console.error('Error transforming Hawaii:', error);
    }
  }
  
  return transformedFeature;
};

/**
 * Transforms an entire GeoJSON FeatureCollection
 * @param {Object} featureCollection - GeoJSON FeatureCollection
 * @returns {Object} - Transformed FeatureCollection
 */
export const transformGeoJSON = (featureCollection) => {
  if (!featureCollection || !featureCollection.features) {
    console.warn('Invalid or empty featureCollection:', featureCollection);
    return featureCollection;
  }
  
  console.log(`Transforming GeoJSON with ${featureCollection.features.length} features`);
  
  const transformedCollection = {
    ...featureCollection,
    features: featureCollection.features.map(feature => transformFeature(feature))
  };
  
  console.log('GeoJSON transformation completed');
  return transformedCollection;
};

export default {
  transformFeature,
  transformGeoJSON
}; 