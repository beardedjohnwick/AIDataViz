# v1.7.0 - NOT Logic Support

## Major Changes
- Added support for exclusionary queries using NOT logic keywords
- Enhanced mockLLM to recognize "but not", "except", "without", "excluding", and "not with" patterns
- Implemented separate evaluation of inclusion and exclusion conditions
- Added support for land area data type with "large" and "small" qualifiers

## Frontend Changes
- Updated mockLLM.js to detect NOT logic keywords and parse exclusionary commands
- Enhanced parseMultiConditionalCommand to handle NOT logic patterns and mark exclusion conditions
- Updated applyMultiFilter in MapComponent.js to separately evaluate inclusion and exclusion conditions
- Added land_area data type support with appropriate thresholds (large: >100k sq mi, small: <50k sq mi)
- Improved debug logging to show separation of inclusion vs exclusion conditions
- Maintained full backward compatibility with existing AND/OR logic

## Supported NOT Logic Patterns
- **"but not"**: "states with high income but not high crime rates"
- **"except"**: "states with large populations except those with high crime rates"
- **"without"**: "states with low unemployment without high crime rates"
- **"excluding"**: "states with high income excluding states with large land area"
- **"not with"**: "states with high income not with high crime rates"

## Data Type Enhancements
- Added land_area data type support
- Enhanced value condition parsing to recognize "large" and "small" qualifiers
- Maintained all existing data type support (income, crime_rates, population, unemployment)

# v1.6.9 - OR Conditions

## Major Changes
- Added support for 'OR' logic in multi-conditional filtering
- Enhanced data type handling for income values
- Improved condition evaluation logic for complex queries
- Added detailed debug logging for condition evaluation

## Frontend Changes
- Updated MapComponent.js to support OR condition logic in applyMultiFilter
- Enhanced mockLLM.js to detect and parse OR conditions in commands
- Added income data type-specific adjustments (converting raw dollars to thousands)
- Implemented more robust condition evaluation with detailed debug logging
- Added support for parsing high/low value conditions for different data types

# v1.6.8 - Multi-Conditional and Basic Time-Series Queries

## Major Changes
- Implemented multi-conditional filtering with support for 'and' operations
- Added basic time-series query capabilities for trend analysis
- Enhanced mockLLM with time period parsing functionality
- Improved command interpretation for complex data queries

## Frontend Changes
- Added applyMultiFilter function in MapComponent.js to handle multiple conditions
- Implemented analyzeTimeTrend and checkTrendDirection functions for time-series analysis
- Enhanced mockLLM.js with parseTimePeriod and recognizeTrend functions
- Added support for parsing complex time expressions like "last X years"
- Improved command parsing for multi-conditional queries

# v1.6.7 - Population Data Comparison Fix

## Major Changes
- Fixed population data comparison in filtering operations
- Added data type-specific comparison logic to handle different unit scales
- Implemented debug logging for filter operations

## Frontend Changes
- Updated applyFilter function in MapComponent.js to handle population data correctly
- Added unit conversion for population values (raw numbers to millions)
- Added detailed debug logging to verify filter operations
- Fixed issue where "highlight states with population over X million" wasn't working correctly

# v1.6.6 - Multi-Color Highlighting

## Major Changes
- Implemented multi-color highlighting functionality
- Added support for specifying different colors for different conditions
- Enhanced command parsing to recognize color keywords
- Added overlap detection and purple highlighting for states meeting multiple conditions

## Frontend Changes
- Added applyMultiColorHighlight function in MapComponent.js
- Enhanced mockLLM.js with multi-color command detection and parsing
- Updated style functions to handle color mapping and overlap detection
- Added support for color keywords: red, blue, green, yellow, orange, purple, pink
- Implemented overlap tracking and purple highlighting for multi-condition states

# v1.6.5 - Enhanced Heatmap Functionality

## Major Changes
- Improved heatmap generation with better color schemes
- Added support for multiple data types in heatmaps
- Enhanced color interpolation and legend generation
- Added county-level heatmap support

## Frontend Changes
- Updated applyHeatmap function to support multiple data types
- Added color scheme options (blue-red, green-red, yellow-red)
- Enhanced color interpolation for better visual representation
- Added county-level heatmap functionality
- Improved legend generation with proper value formatting

# v1.6.4 - Geographic Data Integration

## Major Changes
- Integrated comprehensive geographic data for states and counties
- Added support for Alaska and Hawaii transformations
- Implemented territory filtering to exclude non-continental territories
- Enhanced map rendering with proper geographic boundaries

## Frontend Changes
- Added Alaska and Hawaii coordinate transformations
- Implemented territory filtering (excludes Puerto Rico, Guam, etc.)
- Enhanced GeoJSON processing with proper feature handling
- Added support for both state and county level geographic data
- Improved map rendering performance and accuracy

# v1.6.3 - Mock Data Enhancement

## Major Changes
- Expanded mock dataset with more comprehensive state and county data
- Added historical data for trend analysis
- Enhanced data type coverage (income, crime rates, population, unemployment)
- Improved data quality and consistency

## Frontend Changes
- Added comprehensive mock datasets for all 50 states
- Implemented historical data arrays for trend analysis
- Enhanced data type definitions and value ranges
- Added county-level data support
- Improved data consistency across different metrics

# v1.6.2 - Command Interpretation Improvements

## Major Changes
- Enhanced mockLLM command interpretation capabilities
- Added support for more natural language patterns
- Improved error handling and user feedback
- Added comprehensive command suggestions

## Frontend Changes
- Enhanced interpretCommand function with better pattern matching
- Added support for various command formats and phrasings
- Improved error messages and user guidance
- Added comprehensive command examples and suggestions
- Enhanced debug logging for better troubleshooting

# v1.6.1 - Map Component Refactoring

## Major Changes
- Refactored MapComponent for better maintainability
- Improved state management and component structure
- Enhanced performance and rendering efficiency
- Added better error handling and loading states

## Frontend Changes
- Restructured MapComponent with better separation of concerns
- Improved state management with proper React patterns
- Enhanced map rendering performance
- Added loading states and error boundaries
- Improved component reusability and maintainability

# v1.6.0 - Initial Release

## Major Features
- Interactive map visualization with state and county data
- Natural language command interpretation
- Multi-condition filtering capabilities
- Heatmap visualization
- Real-time data filtering and highlighting

## Frontend Features
- React-based map component with Leaflet integration
- Mock LLM for natural language command processing
- Multi-condition filtering with AND/OR logic
- Heatmap generation with customizable color schemes
- State and county level data visualization
- Interactive highlighting and selection
- Responsive design with modern UI components

## Backend Features
- FastAPI-based REST API
- PostgreSQL database with PostGIS extension
- Geographic data storage and retrieval
- County and state boundary data
- Efficient spatial queries and data processing

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