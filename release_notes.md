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