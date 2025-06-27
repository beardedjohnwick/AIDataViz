# Alaska Transformation API

This document explains how to use the Alaska transformation functionality to scale and reposition Alaska on the map.

## Overview

The Alaska transformation API allows you to programmatically adjust the scale and position of Alaska on the map without affecting other territories. This is useful for creating more visually appealing maps where Alaska is more prominently displayed.

## Configuration

All Alaska transformation settings are centralized in the `ALASKA_CONFIG` object in `geoUtils.js`:

```javascript
export const ALASKA_CONFIG = {
  // Default transformation values
  defaults: {
    scale: 0.35,
    scaleY: 0.5,
    translateX: 45,
    translateY: -100
  },
  // Reference point (approximate southwest corner of Texas)
  referencePoint: [-106, 25],
  // Alaska state FIPS code
  stateFips: '02',
  // Alaska county/borough names
  countyNames: ['anchorage', 'juneau', 'fairbanks', 'kenai', 'matanuska', 'kodiak', 'bethel', 'nome', 'sitka', 'valdez'],
  // Approximate bounding box for Alaska
  boundingBox: {
    minLon: -180,
    maxLon: -130,
    minLat: 51,
    maxLat: 72
  }
};
```

## Usage

The API is exposed through the global `window.alaskaTransform` object, which provides the following methods:

### `setTransformation(scale, translateX, translateY, scaleY)`

Sets the scale and position of Alaska.

- `scale`: A number representing the horizontal scale factor (default: 0.35)
- `translateX`: A number representing the horizontal offset from the default position (default: 45)
- `translateY`: A number representing the vertical offset from the default position (default: -100)
- `scaleY`: A number representing the vertical scale factor (default: 0.5)

Returns the current transformation parameters.

```javascript
// Example: Make Alaska larger and move it slightly
window.alaskaTransform.setTransformation(0.5, 50, -90, 0.7);
```

### `getTransformation()`

Returns the current transformation parameters as an object:

```javascript
{
  scale: 0.35,
  scaleY: 0.5,
  translateX: 45,
  translateY: -100
}
```

### `reset()`

Resets Alaska to its default position and scale as defined in `ALASKA_CONFIG.defaults`.

Returns the default transformation parameters.

```javascript
window.alaskaTransform.reset();
```

## Convenience Functions

For easier control, you can define the following global functions:

```javascript
// Set Alaska scale
window.setAlaskaScale = (scale) => window.alaskaTransform.setTransformation(
  scale, 
  window.alaskaTransform.getTransformation().translateX, 
  window.alaskaTransform.getTransformation().translateY,
  window.alaskaTransform.getTransformation().scaleY
);

// Set Alaska Y scale
window.setAlaskaScaleY = (scaleY) => window.alaskaTransform.setTransformation(
  window.alaskaTransform.getTransformation().scale, 
  window.alaskaTransform.getTransformation().translateX, 
  window.alaskaTransform.getTransformation().translateY,
  scaleY
);

// Set Alaska X position
window.setAlaskaTranslateX = (translateX) => window.alaskaTransform.setTransformation(
  window.alaskaTransform.getTransformation().scale, 
  translateX, 
  window.alaskaTransform.getTransformation().translateY,
  window.alaskaTransform.getTransformation().scaleY
);

// Set Alaska Y position
window.setAlaskaTranslateY = (translateY) => window.alaskaTransform.setTransformation(
  window.alaskaTransform.getTransformation().scale, 
  window.alaskaTransform.getTransformation().translateX, 
  translateY,
  window.alaskaTransform.getTransformation().scaleY
);

// Reset Alaska to default
window.resetAlaskaTransformation = () => window.alaskaTransform.reset();
```

## Testing

A test function is available to verify that the Alaska transformation is working correctly:

```javascript
// Run the Alaska transformation test
window.testAlaskaTransformation = () => {
  console.log('Testing Alaska transformation...');
  
  // Test 1: Scale Alaska
  window.alaskaTransform.setTransformation(0.5, 45, -100, 0.7);
  console.log('Test 1: Scaled Alaska to 0.5x horizontally, 0.7x vertically');
  
  setTimeout(() => {
    // Test 2: Move Alaska horizontally
    window.alaskaTransform.setTransformation(0.5, 60, -100, 0.7);
    console.log('Test 2: Moved Alaska right');
    
    setTimeout(() => {
      // Test 3: Move Alaska vertically
      window.alaskaTransform.setTransformation(0.5, 60, -80, 0.7);
      console.log('Test 3: Moved Alaska up');
      
      setTimeout(() => {
        // Test 4: Reset Alaska
        window.alaskaTransform.reset();
        console.log('Test 4: Reset Alaska to default position');
        console.log('Alaska transformation test complete!');
      }, 2000);
    }, 2000);
  }, 2000);
};
```

## Examples

```javascript
// Make Alaska larger
window.alaskaTransform.setTransformation(0.5, 45, -100, 0.7);

// Move Alaska further to the right
window.alaskaTransform.setTransformation(0.35, 60, -100, 0.5);

// Move Alaska up
window.alaskaTransform.setTransformation(0.35, 45, -80, 0.5);

// Combine scale and position changes
window.alaskaTransform.setTransformation(0.4, 55, -90, 0.6);

// Reset to default
window.alaskaTransform.reset();
```

## Demo

A demo sequence is also available to showcase the transformation capabilities:

```javascript
// Run the Alaska transformation demo
window.alaskaTransformDemo.run();
```

## How It Works

The transformation works by:

1. Identifying Alaska features based on:
   - FIPS codes (state code '02')
   - County FIPS codes (starting with '02')
   - Feature names containing 'alaska'
   - Geographic coordinates within Alaska's bounding box

2. Applying scale and position transformations to those features:
   - Scale: Enlarges or reduces Alaska's horizontal size
   - ScaleY: Enlarges or reduces Alaska's vertical size (helps correct distortion)
   - TranslateX: Moves Alaska horizontally relative to the reference point
   - TranslateY: Moves Alaska vertically relative to the reference point

3. The reference point is set near the southwest corner of Texas

## Notes

- The transformation affects both state and county boundaries for Alaska.
- The transformation is applied in real-time without requiring a page reload.
- The transformation parameters are relative to a reference point defined in `ALASKA_CONFIG.referencePoint`.
- The transformation does not affect any other territories on the map.
- County boundaries are properly transformed along with state boundaries.
- The transformation works regardless of whether counties are toggled on or off.
- Alaska uses a separate Y-scale parameter to help correct the vertical distortion that occurs with standard projections. 