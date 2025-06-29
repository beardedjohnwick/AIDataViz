# Multi-Color Highlighting Functionality

## Overview

The multi-color highlighting functionality allows users to specify different colors for different conditions. When states meet multiple conditions, they are displayed in a single, distinct overlap color (purple) to clearly indicate they satisfy multiple criteria.

## Implementation Details

### 1. Command Recognition (`mockLLM.js`)

The `interpretCommand` function has been enhanced to recognize multi-color highlighting commands:

```javascript
// Check for multi-color highlighting commands
if (isMultiColorCommand(command)) {
  return parseMultiColorCommand(command);
}
```

### 2. Multi-Color Command Detection

The `isMultiColorCommand` function detects commands that contain:
- Color keywords (red, blue, green, yellow, orange, purple, pink)
- Multiple conditions joined by "and"

```javascript
const isMultiColorCommand = (command) => {
  const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink'];
  const hasColors = colorKeywords.some(color => command.includes(` in ${color}`) || command.includes(` ${color}`));
  const hasMultipleConditions = command.includes(' and ');
  
  return hasColors && hasMultipleConditions;
};
```

### 3. Command Parsing

The `parseMultiColorCommand` function:
- Splits commands by "and" to get individual colored conditions
- Extracts target type (state/county)
- Parses each colored condition using `parseColoredCondition`

### 4. Colored Condition Parsing

The `parseColoredCondition` function:
- Extracts color from condition text
- Parses the actual condition (trend or value-based)
- Returns structured condition with color

### 5. Value Condition Parsing for Colors

The `parseValueConditionForColor` function handles:
- **Qualitative terms**: "high", "low", "above average", "below average"
- **Explicit numerical conditions**: "over", "above", "greater than", "under", "below", "less than"
- **Data type recognition**: population, crime_rates, income, unemployment, land_area

#### Qualitative Term Thresholds:
- **High income**: > $65,000
- **Low income**: < $60,000
- **High crime rates**: > 10%
- **Low crime rates**: < 8%
- **High unemployment**: > 7%
- **Low unemployment**: < 6%
- **High population**: > 15 million
- **Low population**: < 10 million
- **High land area**: > 100k square miles
- **Low land area**: < 50k square miles

### 6. Multi-Color Highlighting Application (`MapComponent.js`)

The `applyMultiColorHighlight` function:

1. **Processes each colored condition**:
   - Handles trend-based conditions using historical data
   - Handles value-based conditions using mock datasets
   - Applies data type-specific adjustments

2. **Tracks overlaps**:
   - Identifies states that meet multiple conditions
   - Stores overlap information for detailed logging

3. **Creates final highlighting data**:
   - States meeting single conditions: assigned color
   - States meeting multiple conditions: purple (overlap color)

4. **Maps colors to numeric values**:
   ```javascript
   const colorMap = {
     'red': 0.9,
     'blue': 0.7,
     'green': 0.5,
     'yellow': 0.3,
     'orange': 0.8,
     'purple': 0.6, // Overlap color
     'pink': 0.4
   };
   ```

5. **Applies highlighting** using existing system

### 7. Style Function Updates

Both `stateStyleFunction` and `countyStyleFunction` have been updated to:
- Map numeric color values back to actual colors
- Handle both string and numeric color values
- Display purple for overlapping states

## Supported Commands

### Test Commands:

1. **"highlight states with populations over 15 million in red and states with land area greater than 150 thousand square miles in blue"**
   - Should show: California and Texas in purple (overlap), other qualifying states in their assigned colors

2. **"highlight states with high income in green and states with low crime rates in yellow"**
   - Should show: States meeting only one condition in their assigned color, any overlaps in purple

3. **"show states with populations over 20 million in red and states with income over 70000 in blue"**
   - Should create clear visual distinction between single-condition and overlapping states

### Command Patterns:

- `highlight [target] with [condition] in [color] and [condition] in [color]`
- `show [target] with [condition] in [color] and [condition] in [color]`
- `display [target] with [condition] in [color] and [condition] in [color]`

### Supported Colors:
- red, blue, green, yellow, orange, purple, pink

### Supported Data Types:
- population, crime_rates, income, unemployment, land_area

### Supported Conditions:
- Qualitative: high, low, above average, below average
- Quantitative: over, above, greater than, under, below, less than
- Numerical values with units: million, thousand, k

## Expected Results

### Visual Output:
- States meeting only one condition: assigned color (red, blue, green, yellow, etc.)
- States meeting multiple conditions: purple
- Clear visual distinction between single-condition and overlapping states

### Console Output:
```
Multi-color highlight results: {
  totalHighlighted: 5,
  overlapping: 2,
  overlapStates: ['48', '06'],
  colorBreakdown: [
    { color: 'red', count: 2 },
    { color: 'blue', count: 1 },
    { overlap: { color: 'purple', count: 2 } }
  ]
}
Overlapping states (shown in purple): { '48': ['red', 'blue'], '06': ['red', 'blue'] }
State 48: meets conditions for red + blue → displayed as purple
State 06: meets conditions for red + blue → displayed as purple
```

## Data Sources

### Mock Datasets:
- **Population**: Values in millions
- **Income**: Values in thousands of dollars
- **Crime Rates**: Values as decimals (0.0-1.0)
- **Unemployment**: Values as decimals (0.0-1.0)
- **Land Area**: Values in thousands of square miles

### Historical Data:
- Available for income and crime_rates
- Supports trend-based conditions
- 5-year time series data (2019-2023)

## Backward Compatibility

- All existing single-color highlighting functionality remains unchanged
- Existing heatmap and filter capabilities are preserved
- Command parsing for other command types is unaffected

## Success Criteria

✅ Multi-color commands are correctly parsed
✅ States meeting single conditions show their assigned colors
✅ States meeting multiple conditions show purple
✅ Console provides clear information about overlaps and color assignments
✅ All existing functionality continues to work
✅ Comprehensive logging for debugging
✅ Support for qualitative and quantitative conditions
✅ Proper data type handling and unit conversions 