# v1.5.0 - Map Bounds Implementation

## Major Changes
- Added map bounds to restrict user dragging beyond geographic limits
- Prevents users from navigating too far from the US map area
- Implemented maxBoundsViscosity for strict boundary enforcement

## Frontend Changes
- Added maxBounds property to MapContainer in MapComponent.js
- Set coordinate bounds to keep focus on US territories
- Added maxBoundsViscosity setting to ensure strict boundary adherence

# v1.4.0 - Alaska Position Further Refinement

## Major Changes
- Further refined Alaska's position on the map for better visual representation
- Enhanced map hover interactions for better user experience

## Frontend Changes
- Updated ALASKA_CONFIG in geoUtils.js to adjust Alaska's position
- Changed translateY value from -70 to -30 for optimal positioning
- Improved tooltip behavior in MapComponent.js
- Enhanced hover state styling in MapStyles.css

# v1.3.0 - Alaska Position Refinement

## Major Changes
- Further refined Alaska's position on the map
- Improved map hover interactions for both states and counties

## Frontend Changes
- Updated ALASKA_CONFIG in geoUtils.js to adjust Alaska's position
- Changed translateY value from -100 to -30 for better positioning
- Enhanced hover interactions in MapComponent.js
- Refined styling in MapStyles.css

# v1.2.0 - Alaska Position Update

## Major Changes
- Moved Alaska position further north on the map
- Adjusted default Alaska transformation parameters

## Frontend Changes
- Updated ALASKA_CONFIG in geoUtils.js to move Alaska north
- Changed translateY value from -100 to -70

# v1.1.0 - Map Component Refactoring

## Major Changes
- Reorganized map components structure
- Added Hawaii transformation functionality
- Created backend services and utilities
- Refactored frontend code for better maintainability

## Frontend Changes
- Moved old map components to `old_map_components` directory
- Enhanced MapComponent.js with improved functionality
- Added Hawaii transformation utilities and documentation
- Updated API service and geo utilities

## Backend Changes
- Added services directory with database service
- Added utilities directory with geo utilities
- Improved code organization and structure

This release represents a significant refactoring of the codebase to improve maintainability and add new geographic transformation capabilities.

To revert to previous version if needed, use:
```
git checkout v1.0.0
``` 