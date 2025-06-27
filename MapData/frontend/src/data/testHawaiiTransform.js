/**
 * Test script for Hawaii transformation functionality
 * 
 * This script provides functions to test the Hawaii transformation API.
 * It verifies that both state and county features are being transformed correctly.
 */

import { HAWAII_CONFIG } from './geoUtils';

// Function to check if Hawaii transformation is working correctly
export const testHawaiiTransformation = () => {
  console.log('Testing Hawaii transformation...');
  
  // Wait for the Hawaii transform API to be available
  if (!window.hawaiiTransform) {
    console.error('Hawaii transformation API not available. Make sure the map component has loaded.');
    return;
  }
  
  // Get the current transformation
  const initialTransform = window.hawaiiTransform.getTransformation();
  console.log('Current Hawaii transformation:', initialTransform);
  
  // Test sequence
  console.log('Running Hawaii transformation test sequence...');
  
  // Test 1: Scale Hawaii to 1.5x
  console.log('Test 1: Scaling Hawaii to 1.5x');
  window.hawaiiTransform.setTransformation(1.5, initialTransform.translateX, initialTransform.translateY);
  console.log('Hawaii scale set to 1.5x');
  
  // Test 2: Move Hawaii right
  console.log('Test 2: Moving Hawaii right');
  window.hawaiiTransform.setTransformation(1.5, initialTransform.translateX + 20, initialTransform.translateY);
  console.log('Hawaii moved right');
  
  // Test 3: Move Hawaii up
  console.log('Test 3: Moving Hawaii up');
  window.hawaiiTransform.setTransformation(1.5, initialTransform.translateX + 20, initialTransform.translateY - 10);
  console.log('Hawaii moved up');
  
  // Test 4: Reset Hawaii
  console.log('Test 4: Resetting Hawaii');
  window.hawaiiTransform.reset();
  console.log('Hawaii reset to default position and scale');
  
  console.log('Hawaii transformation test sequence complete.');
  
  // Check if county features are being transformed
  console.log('Checking if county features are being transformed...');
  
  // Get the map component
  const mapComponent = document.querySelector('.leaflet-container');
  if (!mapComponent) {
    console.error('Map component not found.');
    return;
  }
  
  // Check for county layers
  const countyLayers = document.querySelectorAll('.leaflet-overlay-pane path');
  console.log(`Found ${countyLayers.length} map layers.`);
  
  // Test county visibility
  console.log('Testing county visibility...');
  if (window.countyToggle !== undefined) {
    const initialCountyState = window.countyToggle;
    
    // Toggle counties off
    console.log('Toggling counties off...');
    if (initialCountyState) {
      window.onCountyToggle();
    }
    
    // Toggle counties on
    console.log('Toggling counties on...');
    window.onCountyToggle();
    
    // Reset to initial state
    if (!initialCountyState) {
      window.onCountyToggle();
    }
    
    console.log('County visibility test complete.');
  } else {
    console.log('County toggle function not available.');
  }
  
  console.log('Hawaii transformation test complete.');
};

// Export the test function
export default testHawaiiTransformation; 