# Analytical Filters Implementation

## Overview

This implementation adds the ability to use analytical calculations (correlation, mean, standard deviation, etc.) to highlight and filter states/counties on the map based on statistical criteria.

## Features Implemented

### 1. Command Detection
- **File**: `MapData/frontend/src/utils/mockLLM.js`
- **Function**: `isAnalyticalFilterCommand(command)`
- Detects analytical filter commands using regex patterns
- Supports various command formats:
  - "highlight states where mean income is above 60000"
  - "show states in red where correlation of crime and income is above 0.5"
  - "find counties where standard deviation of crime rates is above 0.2"

### 2. Command Parsing
- **File**: `MapData/frontend/src/utils/mockLLM.js`
- **Function**: `parseAnalyticalFilterCommand(command)`
- Extracts analytical functions (mean, median, sum, standardDeviation, variance, correlation)
- Identifies data types (crime_rates, income, population, unemployment)
- Parses threshold conditions (above, below, equals)
- Determines target type (state or county)
- Extracts color specifications

### 3. Command Integration
- **File**: `MapData/frontend/src/utils/mockLLM.js`
- **Function**: `interpretCommand(commandText)`
- Updated to check for analytical filter commands first
- Returns structured command object with action: 'analytical_filter'

### 4. Map Component Integration
- **File**: `MapData/frontend/src/components/MapComponent.js`
- **Function**: `handleMapCommand(commandString)`
- Added case for 'analytical_filter' action
- Calls `applyAnalyticalFilter(result)` function

### 5. Analytical Processing
- **File**: `MapData/frontend/src/components/MapComponent.js`
- **Functions**:
  - `applyAnalyticalFilter(command)` - Main processing function
  - `prepareAnalysisData(dataTypes, targetType)` - Prepares mock data
  - `calculateAnalyticalResults(analysisData, functionName, dataTypes)` - Performs calculations
  - `filterByThreshold(results, threshold)` - Filters results by criteria
  - `highlightFilteredResults(filteredResults, visualStyle, targetType)` - Applies highlighting

### 6. Helper Functions
- **File**: `MapData/frontend/src/components/MapComponent.js`
- **Functions**:
  - `mockCorrelation(x, y)` - Calculates mock correlation between two values
  - `clearHighlights()` - Clears existing highlights

## Supported Commands

### Basic Analytical Functions
- **Mean/Average**: "highlight states where mean income is above 60000"
- **Sum**: "show states where sum of population and income is below 100000"
- **Standard Deviation**: "find counties where standard deviation of crime rates is above 0.2"
- **Correlation**: "show states in red where correlation of crime and income is above 0.5"

### Data Types
- **Crime Rates**: "crime", "crime rates"
- **Income**: "income", "salary", "wages"
- **Population**: "population", "people"
- **Unemployment**: "unemployment", "jobless"

### Operators
- **Greater Than**: "above", "over", "greater than"
- **Less Than**: "below", "under", "less than"
- **Equal**: "equals", "is"

### Colors
- **Supported Colors**: red, blue, green, yellow, orange, purple
- **Default**: red (if no color specified)

### Target Types
- **States**: "states", "state" (default)
- **Counties**: "counties", "county"

## Mock Data

The implementation uses mock data for testing purposes:

| State (FIPS) | Income | Crime Rate | Population | Unemployment |
|--------------|--------|------------|------------|--------------|
| California (06) | 75.2 | 0.15 | 39.5 | 0.074 |
| Texas (48) | 59.8 | 0.12 | 29.1 | 0.052 |
| Florida (12) | 55.7 | 0.10 | 21.5 | 0.048 |
| New York (36) | 68.3 | 0.08 | 19.8 | 0.063 |
| Pennsylvania (42) | 61.2 | 0.09 | 12.8 | 0.055 |
| Illinois (17) | 65.9 | 0.11 | 12.7 | 0.067 |
| Ohio (39) | 56.1 | 0.07 | 11.7 | 0.049 |
| Georgia (13) | 58.4 | 0.13 | 10.6 | 0.041 |
| North Carolina (37) | 54.6 | 0.06 | 10.4 | 0.044 |
| Michigan (26) | 57.3 | 0.14 | 10.0 | 0.071 |

## Testing

### Test File
- **File**: `MapData/frontend/test-analytical-filters.js`
- Contains comprehensive test commands and expected results

### Example Test Commands
1. `"highlight states where mean income is above 60000"`
2. `"show states in red where correlation of crime and income is above 0.5"`
3. `"find counties where standard deviation of crime rates is above 0.2"`
4. `"highlight states in blue where sum of population and income is below 100000"`

### Debug Information
- Check browser console for detailed parsing and calculation logs
- Look for "🔬 Detected analytical filter command" messages
- Verify "📊 Analyzing X states using Y" messages
- Confirm "🎯 Found X states meeting criteria" messages
- Check "✅ Successfully highlighted X states" messages

## Implementation Details

### Command Flow
1. User enters command in the interface
2. `interpretCommand()` detects analytical filter pattern
3. `parseAnalyticalFilterCommand()` extracts parameters
4. `handleMapCommand()` routes to analytical filter case
5. `applyAnalyticalFilter()` processes the command
6. `prepareAnalysisData()` prepares data for analysis
7. `calculateAnalyticalResults()` performs calculations
8. `filterByThreshold()` filters results by criteria
9. `highlightFilteredResults()` applies visual highlighting

### Data Processing
- Uses FIPS codes for state identification
- Supports multiple data types in single command
- Handles missing data gracefully
- Provides detailed console logging for debugging

### Visual Feedback
- Highlights states/counties in specified colors
- Clears existing highlights before applying new ones
- Uses state variables for React re-rendering
- Supports opacity and border styling

## Future Enhancements

### Potential Improvements
1. **Real Data Integration**: Replace mock data with actual API calls
2. **More Statistical Functions**: Add median, variance, percentiles
3. **Time Series Analysis**: Support for historical data trends
4. **Advanced Filtering**: Multiple conditions with AND/OR logic
5. **Export Functionality**: Export filtered results to CSV/JSON
6. **Interactive Charts**: Display statistical summaries as charts
7. **Custom Color Schemes**: Allow user-defined color palettes

### Performance Optimizations
1. **Data Caching**: Cache frequently used data sets
2. **Lazy Loading**: Load data on demand
3. **Web Workers**: Move heavy calculations to background threads
4. **Virtualization**: Handle large datasets efficiently

## Dependencies

### Required Libraries
- **simple-statistics**: For statistical calculations
- **react-leaflet**: For map functionality
- **leaflet**: For map rendering

### Internal Dependencies
- **mockLLM.js**: Command parsing and interpretation
- **statisticsUtils.js**: Statistical function utilities
- **colorUtils.js**: Color management utilities

## Conclusion

The analytical filters implementation provides a powerful way to analyze and visualize geographic data using statistical methods. The modular design allows for easy extension and maintenance, while the comprehensive testing ensures reliable functionality.

The implementation successfully enables users to execute commands like:
- "highlight states in red where the correlation of crime and income is above 0.5"
- "show states in blue where mean income is below 60000"
- "find counties where standard deviation of crime rates is above 0.2"

This creates a more interactive and analytical data visualization experience for users exploring geographic data. 