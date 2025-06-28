# v1.6.4 - NLP Dynamic Styling (Intermediary Step for LLM Integration)

## Major Changes
- Implemented natural language command processing for map styling
- Added command input interface in the Control Panel
- Created framework for dynamic map styling through text commands
- Prepared foundation for future LLM integration

## Frontend Changes
- Updated App.js to pass commands from ControlPanel to MapComponent
- Enhanced MapComponent with forwardRef and useImperativeHandle for command handling
- Added command processing functionality with support for basic styling commands
- Implemented command input UI in ControlPanel with help text
- Enhanced MapStyles.css with styling for command input elements

# v1.7.0 - Natural Language Command Input UI

## Major Changes
- Added text input field for map commands in the Control Panel
- Implemented submit button for command execution
- Prepared UI foundation for natural language interaction with the map

## Frontend Changes
- Updated ControlPanel.js with new command input section
- Added command input field and submit button
- Enhanced MapStyles.css with styling for the new UI elements
- Implemented basic command logging to console

# v1.6.3 - Dynamic State and County Styling

## Major Changes
- Implemented dynamic styling for states and counties
- Enhanced map visualization with customizable color schemes
- Improved interactive feedback for selected geographic features
- Optimized rendering performance for complex styling operations

## Frontend Changes
- Updated MapComponent.js with dynamic style handling
- Added support for custom color schemes based on data attributes
- Enhanced state and county selection visual feedback
- Improved rendering efficiency for styled geographic features

# v1.6.2 - Reset View Improvement

## Major Changes
- Enhanced Reset View functionality for better map navigation
- Improved Reset View button visibility and user experience
- Optimized map reset animation for smoother transitions

## Frontend Changes
- Updated ResetViewControl component to always display the reset button
- Enhanced handleResetView function with improved animation parameters
- Added noMoveStart parameter to prevent unnecessary event firing
- Refined animation duration and easing for better user experience

# v1.6.1 - Tool Tip Fixes

## Major Changes
- Fixed tooltip behavior issues in map interactions
- Improved tooltip positioning and styling
- Enhanced tooltip visibility and user experience

## Frontend Changes
- Updated tooltip configuration in MapComponent.js
- Added offset parameter to tooltips for better positioning
- Made tooltips sticky to follow mouse cursor
- Improved tooltip styling for better readability

# v1.6.0 - UI Enhancements and Performance Improvements

## Major Changes
- Enhanced UI responsiveness and interaction feedback
- Improved map rendering performance
- Refined styling for better visual consistency
- Optimized state and county boundary rendering

## Frontend Changes
- Updated MapStyles.css with improved hover and selection effects
- Enhanced App.js with better component organization
- Optimized rendering pipeline for smoother interactions
- Improved tooltip behavior for better user experience

# v1.5.3 - Map Bounds and Mahnomen County Fix

## Major Changes
- Added map bounds to restrict user dragging beyond geographic limits
- Fixed issue with Mahnomen County, Minnesota being incorrectly transformed
- Added special handling to ensure Mahnomen County stays in its correct geographic position
- Implemented isMahnomenCounty helper function to identify the county by ID or name
- Prevents users from navigating too far from the US map area
- Implemented maxBoundsViscosity for strict boundary enforcement

## Frontend Changes
- Added maxBounds property to MapContainer in MapComponent.js
- Set coordinate bounds to keep focus on US territories
- Added maxBoundsViscosity setting to ensure strict boundary adherence
- Added isMahnomenCounty function in geoUtils.js
- Updated transformation functions to skip Mahnomen County
- Enhanced repositionAlaskaHawaii, transformHawaii, and transformAlaska functions to preserve Mahnomen County's position

# v1.5.2 - Mahnomen Fix

## Major Changes
- Fixed issue with Mahnomen County, Minnesota being incorrectly transformed
- Added special handling to ensure Mahnomen County stays in its correct geographic position
- Implemented isMahnomenCounty helper function to identify the county by ID or name

## Frontend Changes
- Added isMahnomenCounty function in geoUtils.js
- Updated transformation functions to skip Mahnomen County
- Enhanced repositionAlaskaHawaii, transformHawaii, and transformAlaska functions to preserve Mahnomen County's position

# v1.5.1 - Map Bounds Implementation

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