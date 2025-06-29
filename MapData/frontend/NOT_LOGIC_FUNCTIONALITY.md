# NOT Logic Functionality

## Overview

The mock LLM has been enhanced to understand and process exclusionary queries using "not", "except", "without", and "but not" keywords. This allows users to find locations that meet certain criteria while explicitly excluding others (e.g., "Show me states with high income but not high crime rates").

## Implementation Details

### 1. NOT Logic Detection (`mockLLM.js`)

The `hasNotLogic` function detects exclusionary keywords:

```javascript
const hasNotLogic = (command) => {
  const notKeywords = ['but not', 'except', 'without', 'not with', 'excluding'];
  return notKeywords.some(keyword => command.includes(keyword));
};
```

### 2. Enhanced Command Parsing

The `interpretCommand` function now checks for NOT logic before regular AND/OR logic:

```javascript
// Check for multi-conditional commands (including NOT logic)
if (command.includes(' and ') || command.includes(' or ') || hasNotLogic(command)) {
  return parseMultiConditionalCommand(command);
}
```

### 3. Multi-Conditional Parsing with NOT Logic

The `parseMultiConditionalCommand` function handles exclusionary logic:

```javascript
// Check for NOT logic first
if (hasNotLogic(command)) {
  hasExclusion = true;
  
  // Handle different NOT patterns
  if (command.includes('but not')) {
    parts = command.split(' but not ');
    operator = 'and_not';
  } else if (command.includes('except')) {
    parts = command.split(' except ');
    operator = 'and_not';
  } else if (command.includes('without')) {
    parts = command.split(' without ');
    operator = 'and_not';
  } else if (command.includes('excluding')) {
    parts = command.split(' excluding ');
    operator = 'and_not';
  } else if (command.includes('not with')) {
    parts = command.split(' not with ');
    operator = 'and_not';
  }
}
```

### 4. Condition Marking

Conditions after NOT keywords are marked with `exclude: true`:

```javascript
// Parse each condition
for (let i = 0; i < parts.length; i++) {
  const part = parts[i].trim();
  const condition = parseIndividualCondition(part);
  if (condition) {
    // Mark exclusion conditions
    if (hasExclusion && i > 0) {
      condition.exclude = true;
    }
    conditions.push(condition);
  }
}
```

### 5. Enhanced Multi-Filter Application (`MapComponent.js`)

The `applyMultiFilter` function now handles NOT logic by:

1. **Separating conditions**: Inclusion vs exclusion conditions
2. **Evaluating inclusion conditions**: States must meet these criteria
3. **Evaluating exclusion conditions**: States meeting these criteria are excluded
4. **Final decision**: Include only states that meet inclusion AND do not meet exclusion

```javascript
// Separate inclusion and exclusion conditions
const inclusionConditions = conditions.filter(c => !c.exclude);
const exclusionConditions = conditions.filter(c => c.exclude);

// Final decision: include if meets inclusion conditions AND does not meet exclusion conditions
const shouldInclude = meetsInclusionConditions && !meetsExclusionConditions;
```

## Supported NOT Logic Patterns

### Keywords
- `but not` - "states with high income but not high crime rates"
- `except` - "states with large populations except those with high crime rates"
- `without` - "states with low unemployment without high crime rates"
- `excluding` - "states with high income excluding states with large land area"
- `not with` - "states with high income not with high crime rates"

### Data Types Supported
- **Income**: "high income", "low income"
- **Crime Rates**: "high crime rates", "low crime rates"
- **Population**: "large populations", "small populations"
- **Unemployment**: "high unemployment", "low unemployment"
- **Land Area**: "large land area", "small land area"

### Thresholds
- **High income**: > $65,000
- **Low income**: < $60,000
- **High crime rates**: > 10%
- **Low crime rates**: < 8%
- **High unemployment**: > 7%
- **Low unemployment**: < 6%
- **High population**: > 15 million
- **Low population**: < 10 million
- **Large land area**: > 100k square miles
- **Small land area**: < 50k square miles

## Test Commands

### NOT Logic Commands
1. **"show states with high income but not high crime rates"**
   - Should highlight states with income > 65k AND crime rates < 0.1

2. **"highlight states with large populations except those with high crime rates"**
   - Should highlight populous states while excluding those with high crime

3. **"find states with low unemployment without high crime rates"**
   - Should highlight states with low unemployment while excluding high crime states

4. **"show states with high income excluding states with large land area"**
   - Should highlight high-income states while excluding large states

### Regular AND/OR Logic (Still Working)
1. **"show states where income went up and crime rates fell"**
   - Should highlight states meeting both trend conditions

2. **"highlight states with high income or low crime rates"**
   - Should highlight states meeting either condition

## Expected Results

### Console Output
```
Parsing multi-conditional command: show states with high income but not high crime rates
NOT logic detected: { operator: 'and_not', parts: ['show states with high income', 'high crime rates'] }
Applying multi-filter with operator: and_not
Inclusion conditions: 1
Exclusion conditions: 1
Multi-filter results: {
  operator: 'and_not',
  inclusionConditions: 1,
  exclusionConditions: 1,
  matchCount: 2,
  matches: ['51', '25']
}
```

### Behavior
- NOT commands should highlight fewer states than equivalent AND commands
- States meeting inclusion criteria but also meeting exclusion criteria should NOT be highlighted
- All existing AND/OR logic should continue to work
- Console provides clear breakdown of inclusion vs exclusion evaluation

## Backward Compatibility

The implementation maintains full backward compatibility:
- All existing AND/OR logic continues to work
- Single-condition commands are unaffected
- Multi-color highlighting functionality is preserved
- Heatmap functionality remains unchanged

## Error Handling

The system gracefully handles edge cases:
- No inclusion conditions: starts with all items
- Multiple exclusions: any exclusion condition excludes the item
- Invalid conditions: logged as warnings, skipped in processing
- Missing data: logged as errors, condition evaluation fails safely

## Success Criteria

✅ NOT commands are correctly parsed and identified  
✅ Exclusion conditions properly filter out unwanted results  
✅ States meeting inclusion criteria but also exclusion criteria are not highlighted  
✅ Console provides clear breakdown of inclusion vs exclusion evaluation  
✅ All existing functionality continues to work  
✅ Backward compatibility is maintained  
✅ Edge cases are handled gracefully  