# Hawaii Transformation API

This document explains how to use the Hawaii transformation functionality to scale and reposition Hawaii on the map.

## Overview

The Hawaii transformation API allows you to programmatically adjust the scale and position of Hawaii on the map without affecting other territories. This is useful for creating more visually appealing maps where Hawaii is more prominently displayed.

## Configuration

All Hawaii transformation settings are centralized in the `HAWAII_CONFIG` object in `geoUtils.js`:

```javascript
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
```

## Usage

The API is exposed through the global `window.hawaiiTransform` object, which provides the following methods:

### `setTransformation(scale, translateX, translateY)`

Sets the scale and position of Hawaii.

- `scale`: A number representing the scale factor (default: 1.0)
- `translateX`: A number representing the horizontal offset from the default position (default: 158)
- `translateY`: A number representing the vertical offset from the default position (default: -18)

Returns the current transformation parameters.

```javascript
// Example: Make Hawaii twice as large and move it slightly
window.hawaiiTransform.setTransformation(2.0, 170, -20);
```

### `getTransformation()`

Returns the current transformation parameters as an object:

```javascript
{
  scale: 1.0,
  translateX: 158,
  translateY: -18
}
```

### `reset()`

Resets Hawaii to its default position and scale as defined in `HAWAII_CONFIG.defaults`.

Returns the default transformation parameters.

```javascript
window.hawaiiTransform.reset();
```

## Convenience Functions

For easier control, the following global functions are also available:

```javascript
// Set Hawaii scale
window.setHawaiiScale(1.5);

// Set Hawaii X position
window.setHawaiiTranslateX(170);

// Set Hawaii Y position
window.setHawaiiTranslateY(-25);

// Reset Hawaii to default
window.resetHawaiiTransformation();
```

## Testing

A test function is available to verify that the Hawaii transformation is working correctly:

```javascript
// Run the Hawaii transformation test
window.testHawaiiTransformation();
```

This will run a series of tests to ensure that:
1. Hawaii can be scaled properly
2. Hawaii can be moved horizontally and vertically
3. Both state and county boundaries are transformed correctly
4. The transformation works with counties toggled on and off

## Examples

```javascript
// Make Hawaii larger
window.hawaiiTransform.setTransformation(1.5, 158, -18);

// Move Hawaii further to the right
window.hawaiiTransform.setTransformation(1.0, 180, -18);

// Move Hawaii up
window.hawaiiTransform.setTransformation(1.0, 158, -30);

// Combine scale and position changes
window.hawaiiTransform.setTransformation(1.8, 170, -25);

// Reset to default
window.hawaiiTransform.reset();
```

## Demo

A demo sequence is also available to showcase the transformation capabilities:

```javascript
// Run the Hawaii transformation demo
window.hawaiiTransformDemo.run();
```

## How It Works

The transformation works by:

1. Identifying Hawaii features based on:
   - FIPS codes (state code '15')
   - County FIPS codes (starting with '15')
   - Feature names containing 'hawaii'
   - Geographic coordinates within Hawaii's bounding box

2. Applying scale and position transformations to those features:
   - Scale: Enlarges or reduces Hawaii's size
   - TranslateX: Moves Hawaii horizontally relative to the reference point
   - TranslateY: Moves Hawaii vertically relative to the reference point

3. The reference point is set near the southwest corner of Texas

## Notes

- The transformation affects both state and county boundaries for Hawaii.
- The transformation is applied in real-time without requiring a page reload.
- The transformation parameters are relative to a reference point defined in `HAWAII_CONFIG.referencePoint`.
- The transformation does not affect any other territories on the map.
- County boundaries are properly transformed along with state boundaries.
- The transformation works regardless of whether counties are toggled on or off. 