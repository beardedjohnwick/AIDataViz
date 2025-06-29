/**
 * Mock LLM implementation that simulates natural language processing
 * by interpreting specific map commands and returning structured actions.
 * 
 * This is a simple implementation that only understands a few specific commands.
 * In a real application, this would be replaced with an actual LLM API call.
 */

/**
 * Parses number expressions from text into numerical values
 * @param {string} text - The text containing a number expression
 * @returns {number|null} The parsed number or null if parsing failed
 */
export function parseNumberExpression(text) {
  if (!text) return null;
  
  // Convert text to lowercase for consistent matching
  const lowerText = text.trim().toLowerCase();
  
  // Handle percentage values
  if (lowerText.endsWith('%')) {
    const percentValue = parseFloat(lowerText.replace('%', ''));
    return isNaN(percentValue) ? null : percentValue / 100;
  }
  
  // Handle number words like "million", "thousand", etc.
  const millionRegex = /(\d+(\.\d+)?)\s*million/;
  const thousandRegex = /(\d+(\.\d+)?)\s*thousand/;
  
  const millionMatch = lowerText.match(millionRegex);
  if (millionMatch) {
    return parseFloat(millionMatch[1]) * 1000000;
  }
  
  const thousandMatch = lowerText.match(thousandRegex);
  if (thousandMatch) {
    return parseFloat(thousandMatch[1]) * 1000;
  }
  
  // Handle plain numbers
  const numericValue = parseFloat(lowerText);
  return isNaN(numericValue) ? null : numericValue;
}

/**
 * Maps data type variations to standardized data types
 * @param {string} text - The text containing a data type reference
 * @returns {string|null} The standardized data type or null if not recognized
 */
export function normalizeDataType(text) {
  console.log('Normalizing data type:', text);
  
  if (!text) return null;
  
  const lowerText = text.toLowerCase().trim();
  
  // Population variations
  if (/population|pop|people/.test(lowerText)) {
    console.log('Normalized result: population');
    return 'population';
  }
  
  // Crime rate variations
  if (/crime rate|crime rates|crime/.test(lowerText)) {
    console.log('Normalized result: crime_rates');
    return 'crime_rates';
  }
  
  // Income variations
  if (/income|median income|average income/.test(lowerText)) {
    console.log('Normalized result: income');
    return 'income';
  }
  
  // Unemployment variations
  if (/unemployment|unemployment rate/.test(lowerText)) {
    console.log('Normalized result: unemployment');
    return 'unemployment';
  }
  
  console.log('Normalized result: null (not recognized)');
  return null;
}

/**
 * Maps geographic unit references to standardized target types
 * @param {string} text - The text containing a geographic unit reference
 * @returns {string} The standardized target type ('state' or 'county')
 */
export function normalizeGeographicUnit(text) {
  if (!text) return 'state'; // Default to state if not specified
  
  const lowerText = text.toLowerCase().trim();
  
  if (/counties|county/.test(lowerText)) {
    return 'county';
  }
  
  return 'state'; // Default to state for everything else
}

/**
 * Maps condition operators to standardized operator codes
 * @param {string} text - The text containing a condition operator
 * @returns {string|null} The standardized operator code or null if not recognized
 */
export function normalizeOperator(text) {
  if (!text) return null;
  
  const lowerText = text.toLowerCase().trim();
  
  // Greater than variations
  if (/over|above|greater than|>/.test(lowerText)) {
    return 'gt';
  }
  
  // Less than variations
  if (/under|below|less than|</.test(lowerText)) {
    return 'lt';
  }
  
  // Equal to variations
  if (/equal to|equals|=/.test(lowerText)) {
    return 'eq';
  }
  
  // Greater than or equal to variations
  if (/at least|>=/.test(lowerText)) {
    return 'gte';
  }
  
  // Less than or equal to variations
  if (/at most|<=/.test(lowerText)) {
    return 'lte';
  }
  
  return null;
}

/**
 * Recognizes trend keywords in text
 * @param {string} text - The text containing a trend reference
 * @returns {string|null} The standardized trend type or null if not recognized
 */
export function recognizeTrend(text) {
  if (!text) return null;
  
  const lowerText = text.toLowerCase().trim();
  
  // Increase variations
  if (/rose|increased|went up|improved|growing|rising|higher/.test(lowerText)) {
    return 'increase';
  }
  
  // Decrease variations
  if (/dropped|decreased|fell|declined|falling|lower|reducing|reduced/.test(lowerText)) {
    return 'decrease';
  }
  
  // Stable variations
  if (/stayed stable|remained constant|stable|constant|unchanged/.test(lowerText)) {
    return 'stable';
  }
  
  return null;
}

/**
 * Parses time period expressions from text
 * @param {string} text - The text containing a time period reference
 * @returns {Object|null} An object describing the time period or null if parsing failed
 */
export function parseTimePeriod(text) {
  if (!text) return null;
  
  const lowerText = text.toLowerCase().trim();
  
  // Match patterns like "last 2 years", "past 3 years"
  const recentYearsPattern = /(last|past|previous)\s+(\d+)\s+years?/;
  const recentYearsMatch = lowerText.match(recentYearsPattern);
  
  if (recentYearsMatch) {
    return {
      years: parseInt(recentYearsMatch[2], 10),
      type: 'recent'
    };
  }
  
  // Match patterns like "3 of the last 5 years", "2 out of the past 4 years"
  const majorityYearsPattern = /(\d+)\s+(?:of|out of)(?:\s+the)?\s+(last|past|previous)\s+(\d+)\s+years?/;
  const majorityYearsMatch = lowerText.match(majorityYearsPattern);
  
  if (majorityYearsMatch) {
    return {
      threshold: parseInt(majorityYearsMatch[1], 10),
      years: parseInt(majorityYearsMatch[3], 10),
      type: 'majority'
    };
  }
  
  return null;
}

/**
 * Checks if a command contains trend keywords
 * @param {string} command - The command to check
 * @returns {boolean} True if the command contains trend keywords
 */
const hasTrendKeywords = (command) => {
  const trendKeywords = [
    'went up', 'rose', 'increased', 'improved', 'grew',
    'fell', 'dropped', 'decreased', 'declined', 'reduced'
  ];
  return trendKeywords.some(keyword => command.includes(keyword));
};

/**
 * Checks if a command contains NOT logic keywords
 * @param {string} command - The command to check
 * @returns {boolean} True if the command contains NOT logic keywords
 */
const hasNotLogic = (command) => {
  const notKeywords = ['but not', 'except', 'without', 'not with', 'excluding'];
  return notKeywords.some(keyword => command.includes(keyword));
};

/**
 * Checks if a command contains ranking keywords
 * @param {string} command - The command to check
 * @returns {boolean} True if the command contains ranking keywords
 */
const isRankingCommand = (command) => {
  const rankingKeywords = [
    'top', 'bottom', 'highest', 'lowest', 'best', 'worst',
    'first', 'last', 'most', 'least', 'maximum', 'minimum'
  ];
  return rankingKeywords.some(keyword => command.includes(keyword));
};

/**
 * Checks if a command is a comparison command
 * @param {string} command - The command to check for comparison patterns
 * @returns {boolean} True if the command is a comparison command
 */
const isComparisonCommand = (command) => {
  const comparisonPatterns = [
    /\b(higher|greater|more|larger)\s+than\b/,
    /\b(lower|less|smaller)\s+than\b/,
    /\bcompare\s+\w+\s+(to|with|vs|versus)\s+\w+/,
    /\b\w+\s+(vs|versus)\s+\w+/,
    /\bwhere\s+\w+\s+(is|are)\s+(higher|lower|greater|less)\s+than\s+\w+/
  ];
  
  return comparisonPatterns.some(pattern => pattern.test(command));
};

/**
 * Extracts ranking information from a command
 * @param {string} command - The command to parse
 * @returns {Object} Object containing count, direction, dataType, and color
 */
const extractRankingInfo = (command) => {
  let count = null;
  let direction = null;
  let dataType = null;
  let color = null;
  
  // Extract count (number of results to show)
  const countMatch = command.match(/(?:top|bottom|first|last)\s+(\d+)/);
  if (countMatch) {
    count = parseInt(countMatch[1]);
  } else {
    // Look for patterns like "the 3 states" or "3 states" or "3 counties"
    const generalCountMatch = command.match(/(?:the\s+)?(\d+)\s+(?:states?|counties?)/);
    if (generalCountMatch) {
      count = parseInt(generalCountMatch[1]);
    } else if (command.includes('highest') || command.includes('lowest') || 
               command.includes('best') || command.includes('worst') ||
               command.includes('most') || command.includes('least')) {
      count = 5; // Default count for superlatives
    }
  }
  
  // Determine direction (ascending or descending)
  if (command.includes('top') || command.includes('highest') || 
      command.includes('best') || command.includes('most') || 
      command.includes('maximum')) {
    direction = 'desc'; // Show highest values first
  } else if (command.includes('bottom') || command.includes('lowest') || 
             command.includes('worst') || command.includes('least') || 
             command.includes('minimum')) {
    direction = 'asc'; // Show lowest values first
  }
  
  // Extract data type
  if (command.includes('population')) {
    dataType = 'population';
  } else if (command.includes('crime')) {
    dataType = 'crime_rates';
  } else if (command.includes('income')) {
    dataType = 'income';
  } else if (command.includes('unemployment')) {
    dataType = 'unemployment';
  } else if (command.includes('land area') || command.includes('area')) {
    dataType = 'land_area';
  }
  
  // Extract color from the command
  const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink'];
  for (const colorKeyword of colorKeywords) {
    if (command.includes(` in ${colorKeyword}`) || command.includes(` ${colorKeyword}`)) {
      color = colorKeyword;
      break;
    }
  }
  
  // Default color if none specified
  if (!color) {
    color = 'blue'; // Default ranking color
  }
  
  return { count, direction, dataType, color };
};

/**
 * Parses a ranking command
 * @param {string} command - The command to parse
 * @returns {Object} A structured action object
 */
const parseRankingCommand = (command) => {
  console.log('Parsing ranking command:', command);
  
  let targetType = 'state'; // default
  if (command.includes('counties')) {
    targetType = 'county';
  } else if (command.includes('states')) {
    targetType = 'state';
  }
  
  const rankingInfo = extractRankingInfo(command);
  
  if (!rankingInfo.dataType) {
    return { 
      action: 'unknown', 
      suggestion: 'Could not identify data type for ranking query' 
    };
  }
  
  if (!rankingInfo.direction) {
    return { 
      action: 'unknown', 
      suggestion: 'Could not determine ranking direction (highest/lowest)' 
    };
  }
  
  console.log('Parsed ranking info:', rankingInfo);
  
  return {
    action: 'ranking',
    targetType: targetType,
    dataType: rankingInfo.dataType,
    count: rankingInfo.count || 5,
    direction: rankingInfo.direction,
    color: rankingInfo.color
  };
};

/**
 * Parses a multi-conditional command
 * @param {string} command - The command to parse
 * @returns {Object} A structured action object
 */
const parseMultiConditionalCommand = (command) => {
  console.log('Parsing multi-conditional command:', command);
  
  let operator = 'and'; // default
  let parts = [];
  let hasExclusion = false;
  
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
    
    console.log('NOT logic detected:', { operator, parts });
  } else {
    // Handle regular AND/OR logic
    if (command.includes(' and ') && command.includes(' or ')) {
      // Handle mixed operators - prioritize the first one found
      if (command.indexOf(' and ') < command.indexOf(' or ')) {
        operator = 'and';
        parts = command.split(' and ');
      } else {
        operator = 'or';
        parts = command.split(' or ');
      }
      console.log('Mixed operators detected, using:', operator);
    } else if (command.includes(' and ')) {
      operator = 'and';
      parts = command.split(' and ');
    } else if (command.includes(' or ')) {
      operator = 'or';
      parts = command.split(' or ');
    }
  }
  
  if (parts.length < 2) {
    return { action: 'unknown', suggestion: 'Multi-conditional command parsing failed' };
  }
  
  console.log('Operator:', operator);
  console.log('Parts:', parts);
  
  const conditions = [];
  let targetType = 'state'; // default
  
  // Extract target type from the first part
  if (command.includes('counties')) {
    targetType = 'county';
  } else if (command.includes('states')) {
    targetType = 'state';
  }
  
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
  
  if (conditions.length === 0) {
    return { action: 'unknown', suggestion: 'No valid conditions found in multi-conditional command' };
  }
  
  console.log('Parsed conditions:', conditions);
  console.log('Final operator:', operator);
  
  return {
    action: 'multi_filter',
    targetType: targetType,
    conditions: conditions,
    operator: operator
  };
};

/**
 * Parses an individual condition
 * @param {string} conditionText - The condition text to parse
 * @returns {Object|null} A structured condition object or null if parsing failed
 */
const parseIndividualCondition = (conditionText) => {
  console.log('Parsing individual condition:', conditionText);
  
  // Check for trend-based conditions first
  if (hasTrendKeywords(conditionText)) {
    return parseTrendCondition(conditionText);
  }
  
  // Check for value-based conditions
  return parseValueCondition(conditionText);
};

/**
 * Parses a value-based condition
 * @param {string} conditionText - The condition text to parse
 * @returns {Object|null} A structured value condition object or null if parsing failed
 */
const parseValueCondition = (conditionText) => {
  let dataType = null;
  let operator = null;
  let value = null;
  let originalValue = null;
  
  // Extract data type
  if (conditionText.includes('income')) {
    dataType = 'income';
  } else if (conditionText.includes('crime')) {
    dataType = 'crime_rates';
  } else if (conditionText.includes('population')) {
    dataType = 'population';
  } else if (conditionText.includes('unemployment')) {
    dataType = 'unemployment';
  } else if (conditionText.includes('land area') || conditionText.includes('land_area')) {
    dataType = 'land_area';
  }
  
  // Extract operator and value
  if (conditionText.includes('high') || conditionText.includes('above average') || conditionText.includes('large')) {
    // For "high crime rates" or "high income", use a reasonable threshold
    operator = 'gt';
    if (dataType === 'crime_rates') {
      value = 0.1; // 10% crime rate threshold
      originalValue = 'high';
    } else if (dataType === 'income') {
      value = 65000; // $65k income threshold
      originalValue = 'high';
    } else if (dataType === 'unemployment') {
      value = 0.07; // 7% unemployment threshold
      originalValue = 'high';
    } else if (dataType === 'population') {
      value = 15000000; // 15M population threshold
      originalValue = 'high';
    } else if (dataType === 'land_area') {
      value = 100000; // 100k square miles threshold
      originalValue = 'large';
    }
  } else if (conditionText.includes('low') || conditionText.includes('below average') || conditionText.includes('small')) {
    // For "low income" or "low crime rates"
    operator = 'lt';
    if (dataType === 'crime_rates') {
      value = 0.08; // 8% crime rate threshold
      originalValue = 'low';
    } else if (dataType === 'income') {
      value = 60000; // $60k income threshold
      originalValue = 'low';
    } else if (dataType === 'unemployment') {
      value = 0.06; // 6% unemployment threshold
      originalValue = 'low';
    } else if (dataType === 'population') {
      value = 10000000; // 10M population threshold
      originalValue = 'low';
    } else if (dataType === 'land_area') {
      value = 50000; // 50k square miles threshold
      originalValue = 'small';
    }
  }
  
  // Handle explicit numerical conditions (existing logic)
  if (!operator && (conditionText.includes('over') || conditionText.includes('above') || conditionText.includes('greater than'))) {
    operator = 'gt';
    // Extract numerical value (you can reuse existing number parsing logic here)
  } else if (!operator && (conditionText.includes('under') || conditionText.includes('below') || conditionText.includes('less than'))) {
    operator = 'lt';
    // Extract numerical value
  }
  
  if (!dataType || !operator || value === null) {
    console.warn('Could not parse value condition:', conditionText);
    return null;
  }
  
  return {
    type: 'value',
    dataType: dataType,
    condition: {
      operator: operator,
      value: value,
      originalValue: originalValue
    }
  };
};

/**
 * Parses a trend condition
 * @param {string} conditionText - The condition text to parse
 * @returns {Object|null} A structured trend condition object or null if parsing failed
 */
const parseTrendCondition = (conditionText) => {
  let dataType = null;
  let trend = null;
  let timePeriod = { years: 2, type: 'recent' }; // default
  
  // Extract data type
  if (conditionText.includes('income')) {
    dataType = 'income';
  } else if (conditionText.includes('crime')) {
    dataType = 'crime_rates';
  } else if (conditionText.includes('population')) {
    dataType = 'population';
  } else if (conditionText.includes('unemployment')) {
    dataType = 'unemployment';
  }
  
  // Extract trend direction
  if (conditionText.includes('went up') || conditionText.includes('rose') || 
      conditionText.includes('increased') || conditionText.includes('improved')) {
    trend = 'increase';
  } else if (conditionText.includes('fell') || conditionText.includes('dropped') || 
             conditionText.includes('decreased') || conditionText.includes('declined')) {
    trend = 'decrease';
  }
  
  // Extract time period (if specified)
  if (conditionText.includes('last') || conditionText.includes('past')) {
    // Try to use existing parseTimePeriod function
    const extractedTimePeriod = parseTimePeriod(conditionText);
    if (extractedTimePeriod) {
      timePeriod = extractedTimePeriod;
    }
  }
  
  if (!dataType || !trend) {
    console.warn('Could not parse trend condition:', conditionText);
    return null;
  }
  
  return {
    type: 'trend',
    dataType: dataType,
    trend: trend,
    timePeriod: timePeriod
  };
};

/**
 * Parses a trend command
 * @param {string} command - The command to parse
 * @returns {Object} A structured action object
 */
const parseTrendCommand = (command) => {
  // Handle single trend commands (not multi-conditional)
  const condition = parseTrendCondition(command);
  
  if (!condition) {
    return { action: 'unknown', suggestion: 'Could not parse trend command' };
  }
  
  let targetType = 'state';
  if (command.includes('counties')) {
    targetType = 'county';
  }
  
  return {
    action: 'multi_filter',
    targetType: targetType,
    conditions: [condition],
    operator: 'and'
  };
};

/**
 * Parses a comparison command
 * @param {string} command - The comparison command to parse
 * @returns {Object} Parsed comparison command object
 */
const parseComparisonCommand = (command) => {
  console.log('Parsing comparison command:', command);
  
  let targetType = 'state'; // default
  if (command.includes('counties')) {
    targetType = 'county';
  } else if (command.includes('states')) {
    targetType = 'state';
  }
  
  const comparisonInfo = extractComparisonInfo(command);
  
  if (!comparisonInfo.firstMetric || !comparisonInfo.secondMetric) {
    return { 
      action: 'unknown', 
      suggestion: 'Could not identify both metrics for comparison. Try: "show states where income is higher than crime rates"' 
    };
  }
  
  if (!comparisonInfo.operator) {
    return { 
      action: 'unknown', 
      suggestion: 'Could not determine comparison type. Use "higher than", "lower than", etc.' 
    };
  }
  
  console.log('Parsed comparison info:', comparisonInfo);
  
  return {
    action: 'comparison',
    targetType: targetType,
    firstMetric: comparisonInfo.firstMetric,
    secondMetric: comparisonInfo.secondMetric,
    operator: comparisonInfo.operator
  };
};

/**
 * Helper function to extract comparison details
 * @param {string} command - The command to extract comparison info from
 * @returns {Object} Object containing firstMetric, secondMetric, and operator
 */
const extractComparisonInfo = (command) => {
  console.log('=== Extracting Comparison Info ===');
  console.log('Input command:', command);
  
  let firstMetric = null;
  let secondMetric = null;
  let operator = null;
  
  // Extract comparison operator
  if (command.includes('higher than') || command.includes('greater than') || command.includes('more than') || command.includes('larger than')) {
    operator = 'gt';
  } else if (command.includes('lower than') || command.includes('less than') || command.includes('smaller than')) {
    operator = 'lt';
  }
  
  console.log('Detected operator:', operator);
  
  // Improved data type detection with specific patterns
  const dataTypePatterns = [
    { pattern: /\bpopulation\b/, type: 'population' },
    { pattern: /\bcrime rates?\b/, type: 'crime_rates' },
    { pattern: /\bcrime\b/, type: 'crime_rates' },
    { pattern: /\bincome\b/, type: 'income' },
    { pattern: /\bunemployment\b/, type: 'unemployment' },
    { pattern: /\bland area\b/, type: 'land_area' },
    { pattern: /\barea\b/, type: 'land_area' }
  ];
  
  const foundDataTypes = [];
  
  for (const { pattern, type } of dataTypePatterns) {
    if (pattern.test(command)) {
      console.log(`Pattern "${pattern}" matched -> type "${type}"`);
      
      // Avoid duplicates
      if (!foundDataTypes.includes(type)) {
        foundDataTypes.push(type);
      }
    }
  }
  
  console.log('All found data types:', foundDataTypes);
  
  // Assign first and second metrics
  if (foundDataTypes.length >= 2) {
    firstMetric = foundDataTypes[0];
    secondMetric = foundDataTypes[1];
  } else if (foundDataTypes.length === 1) {
    console.warn('Only found one data type:', foundDataTypes[0]);
  } else {
    console.warn('No data types found in command');
  }
  
  console.log('Final extraction result:', { firstMetric, secondMetric, operator });
  console.log('=== End Comparison Info Extraction ===');
  
  return { firstMetric, secondMetric, operator };
};

/**
 * Helper function to normalize data type names for comparison
 * @param {string} dataType - The data type to normalize
 * @returns {string} The normalized data type
 */
const normalizeDataTypeForComparison = (dataType) => {
  if (dataType.includes('crime')) return 'crime_rates';
  if (dataType.includes('population')) return 'population';
  if (dataType.includes('income')) return 'income';
  if (dataType.includes('unemployment')) return 'unemployment';
  if (dataType.includes('land area') || dataType.includes('area')) return 'land_area';
  return dataType;
};

/**
 * Interprets a command string and returns a structured action object
 * @param {string} commandText - The command text to interpret
 * @returns {Object} An action object with the appropriate properties
 */
export function interpretCommand(commandText) {
  // Convert to lowercase for case-insensitive matching
  const command = commandText.toLowerCase().trim();
  
  console.log('=== Mock LLM Debug ===');
  console.log('Input command:', commandText);
  console.log('Normalized command:', command);
  console.log('Is ambiguous:', isAmbiguousQuery(command));
  console.log('Is simple highlight:', isSimpleHighlightCommand(command));
  console.log('Is ranking command:', isRankingCommand(command));
  console.log('Is comparison command:', isComparisonCommand(command));
  console.log('Contains "and":', command.includes(' and '));
  console.log('Contains "or":', command.includes(' or '));
  console.log('Has NOT logic:', hasNotLogic(command));
  console.log('Has trend keywords:', hasTrendKeywords(command));
  
  // Check for ambiguous queries first
  if (isAmbiguousQuery(command)) {
    return handleAmbiguousQuery(command);
  }
  
  // Check for simple highlighting commands BEFORE multi-color commands
  if (isSimpleHighlightCommand(command)) {
    return parseSimpleHighlightCommand(command);
  }
  
  // Check for multi-color highlighting commands
  if (isMultiColorCommand(command)) {
    return parseMultiColorCommand(command);
  }
  
  // Check for ranking commands
  if (isRankingCommand(command)) {
    return parseRankingCommand(command);
  }
  
  // Check for comparison commands
  if (isComparisonCommand(command)) {
    return parseComparisonCommand(command);
  }
  
  // Check for multi-conditional commands (including NOT logic)
  if (command.includes(' and ') || command.includes(' or ') || hasNotLogic(command)) {
    return parseMultiConditionalCommand(command);
  }
  
  // Check for highlight California red command
  if (command.includes('highlight california red')) {
    return {
      action: 'highlightState',
      stateFips: '06', // FIPS code for California
      color: 'red'
    };
  }
  
  // Check for highlight Texas blue command
  if (command.includes('highlight texas blue')) {
    return {
      action: 'highlightState',
      stateFips: '48', // FIPS code for Texas
      color: 'blue'
    };
  }
  
  // Check for clear highlights command
  if (command.includes('clear highlights') || command.includes('clear map')) {
    return {
      action: 'clearHighlights'
    };
  }
  
  // Check for time-series trend commands
  if (hasTrendKeywords(command)) {
    return parseTrendCommand(command);
  }
  
  // Check for multi-conditional commands with time-series analysis (legacy pattern)
  const multiConditionPatterns = [
    /show\s+(\w+)\s+where\s+(.+?)\s+and\s+(.+)$/i,
    /highlight\s+(\w+)\s+where\s+(.+?)\s+and\s+(.+)$/i,
    /find\s+(\w+)\s+where\s+(.+?)\s+and\s+(.+)$/i,
    /display\s+(\w+)\s+where\s+(.+?)\s+and\s+(.+)$/i
  ];
  
  // Try to match any of the multi-condition patterns
  for (const pattern of multiConditionPatterns) {
    const match = command.match(pattern);
    if (match) {
      const [_, geoUnit, condition1Text, condition2Text] = match;
      
      // Normalize the geographic unit
      const targetType = normalizeGeographicUnit(geoUnit);
      
      // Parse the first condition
      const condition1 = parseCondition(condition1Text);
      
      // Parse the second condition
      const condition2 = parseCondition(condition2Text);
      
      if (condition1 && condition2) {
        return {
          action: 'multi_filter',
          targetType: targetType,
          conditions: [condition1, condition2],
          operator: 'and'
        };
      }
    }
  }
  
  // Check for time-series trend commands (legacy pattern)
  const trendPatterns = [
    /highlight\s+(\w+)\s+where\s+(\w+(?:\s+\w+)*)\s+(rose|increased|went up|improved|dropped|decreased|fell|declined|stayed stable|remained constant)\s+(?:for|over)\s+(.+)$/i,
    /show\s+(\w+)\s+where\s+(\w+(?:\s+\w+)*)\s+(rose|increased|went up|improved|dropped|decreased|fell|declined|stayed stable|remained constant)\s+(?:for|over)\s+(.+)$/i,
    /find\s+(\w+)\s+where\s+(\w+(?:\s+\w+)*)\s+has\s+(rose|increased|went up|improved|dropped|decreased|fell|declined|stayed stable|remained constant)\s+(?:for|over)\s+(.+)$/i
  ];
  
  // Try to match any of the trend patterns
  for (const pattern of trendPatterns) {
    const match = command.match(pattern);
    if (match) {
      const [_, geoUnit, dataTypeText, trendText, timePeriodText] = match;
      
      // Normalize the geographic unit
      const targetType = normalizeGeographicUnit(geoUnit);
      
      // Normalize the data type
      const dataType = normalizeDataType(dataTypeText) || 'crime_rates';
      
      // Recognize the trend
      const trend = recognizeTrend(trendText);
      
      // Parse the time period
      const timePeriod = parseTimePeriod(timePeriodText);
      
      if (trend && timePeriod) {
        return {
          action: 'multi_filter',
          targetType: targetType,
          conditions: [
            {
              type: 'trend',
              dataType: dataType,
              trend: trend,
              timePeriod: timePeriod
            }
          ],
          operator: 'and'
        };
      }
    }
  }
  
  // Check for conditional filtering commands
  const filterPatterns = [
    /highlight\s+(\w+)\s+with\s+(\w+(?:\s+\w+)*)\s+(over|above|greater than|>|under|below|less than|<|equal to|equals|=|at least|>=|at most|<=)\s+(.+)$/i,
    /show\s+(\w+)\s+where\s+(\w+(?:\s+\w+)*)\s+(?:is\s+)?(over|above|greater than|>|under|below|less than|<|equal to|equals|=|at least|>=|at most|<=)\s+(.+)$/i,
    /display\s+(\w+)\s+(?:that\s+have|where)\s+(\w+(?:\s+\w+)*)\s+(?:is\s+)?(over|above|greater than|>|under|below|less than|<|equal to|equals|=|at least|>=|at most|<=)\s+(.+)$/i,
    /find\s+(\w+)\s+with\s+(\w+(?:\s+\w+)*)\s+(over|above|greater than|>|under|below|less than|<|equal to|equals|=|at least|>=|at most|<=)\s+(.+)$/i
  ];
  
  // Try to match any of the filter patterns
  for (const pattern of filterPatterns) {
    const match = command.match(pattern);
    if (match) {
      const [_, geoUnit, dataTypeText, operatorText, valueText] = match;
      
      // Normalize the geographic unit
      const targetType = normalizeGeographicUnit(geoUnit);
      
      // Normalize the data type
      const dataType = normalizeDataType(dataTypeText) || 'crime_rates';
      
      // Normalize the operator
      const operator = normalizeOperator(operatorText);
      
      // Parse the value
      const value = parseNumberExpression(valueText);
      
      if (operator && value !== null) {
        return {
          action: 'filter',
          dataType: dataType,
          targetType: targetType,
          condition: {
            operator: operator,
            value: value,
            originalValue: valueText.trim()
          },
          visualStyle: 'highlight'
        };
      }
    }
  }
  
  // Check for heat map commands (legacy pattern)
  if (command.includes('show heat map') || command.includes('show heatmap')) {
    // Determine if it's state or county heat map
    const isCounty = command.includes('county') || command.includes('counties');
    
    // Determine color scheme if specified
    let colorScheme = 'blue-red'; // default
    if (command.includes('green')) {
      colorScheme = 'green-red';
    } else if (command.includes('yellow')) {
      colorScheme = 'yellow-red';
    }
    
    return {
      action: 'showHeatmap',
      mapType: isCounty ? 'county' : 'state',
      colorScheme: colorScheme
    };
  }
  
  // Check for enhanced heatmap commands with data type recognition
  const heatmapPatterns = [
    'show heatmap of',
    'display heatmap for',
    'create heatmap showing',
    'heatmap',
    'show .* heatmap'
  ];
  
  // Check if any heatmap pattern matches
  for (const pattern of heatmapPatterns) {
    const regex = new RegExp(pattern);
    if (regex.test(command)) {
      // Determine the data type
      let dataType = 'crime_rates'; // default
      
      if (command.includes('crime rate') || command.includes('crime rates') || command.includes(' crime ')) {
        dataType = 'crime_rates';
      } else if (command.includes('population')) {
        dataType = 'population';
      } else if (command.includes('income')) {
        dataType = 'income';
      } else if (command.includes('unemployment')) {
        dataType = 'unemployment';
      }
      
      // Determine if it's state or county level
      let targetType = 'state'; // default
      if (command.includes('county') || command.includes('counties')) {
        targetType = 'county';
      } else if (command.includes('state') || command.includes('states')) {
        targetType = 'state';
      }
      
      // Determine color scheme if specified
      let colorScheme = 'blue-red'; // default
      if (command.includes('green')) {
        colorScheme = 'green-red';
      } else if (command.includes('yellow')) {
        colorScheme = 'yellow-red';
      }
      
      return {
        action: 'heatmap',
        dataType: dataType,
        targetType: targetType,
        colorScheme: colorScheme
      };
    }
  }
  
  // Default case for unknown commands
  return {
    action: 'unknown',
    suggestions: [
      "show heatmap of crime rates",
      "highlight states with population over 10 million",
      "display counties where unemployment is less than 5%",
      "show states where income rose for at least 3 of the last 5 years",
      "find states where crime rates have dropped over the last 2 years"
    ]
  };
}

/**
 * Helper function to parse a condition from text
 * @param {string} conditionText - The text containing a condition
 * @returns {Object|null} A structured condition object or null if parsing failed
 */
export function parseCondition(conditionText) {
  if (!conditionText) return null;
  
  // Check for time-series trend condition
  const trendPattern = /(\w+(?:\s+\w+)*)\s+(rose|increased|went up|improved|dropped|decreased|fell|declined|stayed stable|remained constant)\s+(?:for|over)\s+(.+)$/i;
  const trendMatch = conditionText.match(trendPattern);
  
  if (trendMatch) {
    const [_, dataTypeText, trendText, timePeriodText] = trendMatch;
    
    // Normalize the data type
    const dataType = normalizeDataType(dataTypeText) || 'crime_rates';
    
    // Recognize the trend
    const trend = recognizeTrend(trendText);
    
    // Parse the time period
    const timePeriod = parseTimePeriod(timePeriodText);
    
    if (trend && timePeriod) {
      return {
        type: 'trend',
        dataType: dataType,
        trend: trend,
        timePeriod: timePeriod
      };
    }
  }
  
  // Check for value-based condition
  const valuePattern = /(\w+(?:\s+\w+)*)\s+(?:is\s+)?(over|above|greater than|>|under|below|less than|<|equal to|equals|=|at least|>=|at most|<=)\s+(.+)$/i;
  const valueMatch = conditionText.match(valuePattern);
  
  if (valueMatch) {
    const [_, dataTypeText, operatorText, valueText] = valueMatch;
    
    // Normalize the data type
    const dataType = normalizeDataType(dataTypeText) || 'crime_rates';
    
    // Normalize the operator
    const operator = normalizeOperator(operatorText);
    
    // Parse the value
    const value = parseNumberExpression(valueText);
    
    if (operator && value !== null) {
      return {
        type: 'value',
        dataType: dataType,
        condition: {
          operator: operator,
          value: value,
          originalValue: valueText.trim()
        }
      };
    }
  }
  
  return null;
}

/**
 * Checks if a command is a multi-color highlighting command
 * @param {string} command - The command to check
 * @returns {boolean} True if the command is a multi-color highlighting command
 */
const isMultiColorCommand = (command) => {
  // Look for color keywords combined with "and"
  const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink'];
  const hasColors = colorKeywords.some(color => command.includes(` in ${color}`) || command.includes(` ${color}`));
  const hasMultipleConditions = command.includes(' and ');
  
  console.log('Multi-color detection:', { hasColors, hasMultipleConditions });
  return hasColors && hasMultipleConditions;
};

/**
 * Parses a multi-color command
 * @param {string} command - The command to parse
 * @returns {Object} A structured action object
 */
const parseMultiColorCommand = (command) => {
  console.log('Parsing multi-color command:', command);
  
  // Split by "and" to get individual colored conditions
  const parts = command.split(' and ');
  const coloredConditions = [];
  let targetType = 'state'; // default
  
  // Extract target type
  if (command.includes('counties')) {
    targetType = 'county';
  } else if (command.includes('states')) {
    targetType = 'state';
  }
  
  for (const part of parts) {
    const coloredCondition = parseColoredCondition(part.trim());
    if (coloredCondition) {
      coloredConditions.push(coloredCondition);
    }
  }
  
  if (coloredConditions.length === 0) {
    return { action: 'unknown', suggestion: 'No valid colored conditions found' };
  }
  
  console.log('Parsed colored conditions:', coloredConditions);
  
  return {
    action: 'multi_color_highlight',
    targetType: targetType,
    coloredConditions: coloredConditions
  };
};

/**
 * Parses a colored condition
 * @param {string} conditionText - The condition text to parse
 * @returns {Object|null} A structured colored condition object or null if parsing failed
 */
const parseColoredCondition = (conditionText) => {
  console.log('Parsing colored condition:', conditionText);
  
  // Extract color from the condition
  const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink'];
  let color = null;
  
  for (const colorKeyword of colorKeywords) {
    if (conditionText.includes(` in ${colorKeyword}`) || conditionText.includes(` ${colorKeyword}`)) {
      color = colorKeyword;
      // Remove the color part from the condition text for parsing
      conditionText = conditionText.replace(` in ${colorKeyword}`, '').replace(` ${colorKeyword}`, '');
      break;
    }
  }
  
  if (!color) {
    console.warn('No color found in condition:', conditionText);
    return null;
  }
  
  // Parse the actual condition (reuse existing logic)
  let condition = null;
  
  // Check for trend-based conditions
  if (hasTrendKeywords(conditionText)) {
    condition = parseTrendCondition(conditionText);
  } else {
    // Parse value-based conditions
    condition = parseValueConditionForColor(conditionText);
  }
  
  if (!condition) {
    console.warn('Could not parse condition:', conditionText);
    return null;
  }
  
  return {
    condition: condition,
    color: color
  };
};

/**
 * Parses a value condition specifically for colored conditions
 * @param {string} conditionText - The condition text to parse
 * @returns {Object|null} A structured value condition object or null if parsing failed
 */
const parseValueConditionForColor = (conditionText) => {
  let dataType = null;
  let operator = null;
  let value = null;
  let originalValue = null;
  
  // Extract data type
  if (conditionText.includes('population')) {
    dataType = 'population';
  } else if (conditionText.includes('crime')) {
    dataType = 'crime_rates';
  } else if (conditionText.includes('income')) {
    dataType = 'income';
  } else if (conditionText.includes('unemployment')) {
    dataType = 'unemployment';
  } else if (conditionText.includes('land area') || conditionText.includes('land_area')) {
    dataType = 'land_area';
  }
  
  // Handle qualitative terms
  if (conditionText.includes('high') || conditionText.includes('above average') || conditionText.includes('large')) {
    operator = 'gt';
    if (dataType === 'crime_rates') {
      value = 0.1; // 10% crime rate threshold
      originalValue = 'high';
    } else if (dataType === 'income') {
      value = 65000; // $65k income threshold
      originalValue = 'high';
    } else if (dataType === 'unemployment') {
      value = 0.07; // 7% unemployment threshold
      originalValue = 'high';
    } else if (dataType === 'population') {
      value = 15000000; // 15M population threshold
      originalValue = 'high';
    } else if (dataType === 'land_area') {
      value = 100000; // 100k square miles threshold
      originalValue = 'large';
    }
  } else if (conditionText.includes('low') || conditionText.includes('below average') || conditionText.includes('small')) {
    operator = 'lt';
    if (dataType === 'crime_rates') {
      value = 0.08; // 8% crime rate threshold
      originalValue = 'low';
    } else if (dataType === 'income') {
      value = 60000; // $60k income threshold
      originalValue = 'low';
    } else if (dataType === 'unemployment') {
      value = 0.06; // 6% unemployment threshold
      originalValue = 'low';
    } else if (dataType === 'population') {
      value = 10000000; // 10M population threshold
      originalValue = 'low';
    } else if (dataType === 'land_area') {
      value = 50000; // 50k square miles threshold
      originalValue = 'small';
    }
  }
  
  // Handle explicit numerical conditions
  if (!operator && (conditionText.includes('over') || conditionText.includes('above') || conditionText.includes('greater than'))) {
    operator = 'gt';
    const numberMatch = conditionText.match(/(\d+(?:\.\d+)?)\s*(million|thousand|k)?/);
    if (numberMatch) {
      let numValue = parseFloat(numberMatch[1]);
      const unit = numberMatch[2];
      
      if (unit === 'million') {
        numValue *= 1000000;
      } else if (unit === 'thousand' || unit === 'k') {
        numValue *= 1000;
      }
      
      value = numValue;
      originalValue = numberMatch[0];
    }
  } else if (!operator && (conditionText.includes('under') || conditionText.includes('below') || conditionText.includes('less than'))) {
    operator = 'lt';
    const numberMatch = conditionText.match(/(\d+(?:\.\d+)?)\s*(million|thousand|k)?/);
    if (numberMatch) {
      let numValue = parseFloat(numberMatch[1]);
      const unit = numberMatch[2];
      
      if (unit === 'million') {
        numValue *= 1000000;
      } else if (unit === 'thousand' || unit === 'k') {
        numValue *= 1000;
      }
      
      value = numValue;
      originalValue = numberMatch[0];
    }
  }
  
  if (!dataType || !operator || value === null) {
    console.warn('Could not parse value condition for color:', conditionText);
    return null;
  }
  
  return {
    type: 'value',
    dataType: dataType,
    condition: {
      operator: operator,
      value: value,
      originalValue: originalValue
    }
  };
};

/**
 * Helper function to detect ambiguous queries
 * @param {string} command - The command to check for ambiguity
 * @returns {boolean} True if the command is ambiguous
 */
const isAmbiguousQuery = (command) => {
  const ambiguousPatterns = [
    // Vague qualitative terms without context
    /\b(good|bad|best|worst)\s+(states|counties)\b/,
    /\b(show|find|get)\s+(states|counties)\b$/,
    /\b(data|information|stats)\s+(for|about)\s+(states|counties)\b/,
    
    // Missing data type
    /\b(high|low|highest|lowest)\s+(states|counties)\b$/,
    /\b(top|bottom)\s+\d*\s*(states|counties)\b$/,
    /\b(show|find|get)\s+(states|counties)\s+with\s+(high|low|highest|lowest)\b$/,
    
    // Incomplete comparisons
    /\b(better|worse|more|less)\s+(than|states|counties)\b/,
    /\b(compare|comparison)\b/,
    
    // Generic requests
    /\b(help|what|how)\b/,
    /\b(show me|tell me|give me)\s+(something|anything)\b/,
    /\b(tell me|show me)\s+(about|information|data)\s+(states|counties)\b/
  ];
  
  return ambiguousPatterns.some(pattern => pattern.test(command));
};

/**
 * Helper function to categorize ambiguous queries
 * @param {string} command - The command to categorize
 * @returns {string} The category of ambiguity
 */
const categorizeAmbiguousQuery = (command) => {
  if (/\b(good|bad|best|worst)\s+(states|counties)\b/.test(command)) {
    return 'vague_qualitative';
  } else if (/\b(high|low|highest|lowest)\s+(states|counties)\b$/.test(command) || 
             /\b(show|find|get)\s+(states|counties)\s+with\s+(high|low|highest|lowest)\b$/.test(command)) {
    return 'missing_data_type';
  } else if (/\b(top|bottom)\s+\d*\s*(states|counties)\b$/.test(command)) {
    return 'incomplete_ranking';
  } else if (/\b(compare|comparison)\b/.test(command)) {
    return 'comparison_request';
  } else if (/\b(help|what|how)\b/.test(command)) {
    return 'help_request';
  } else if (/\b(tell me|show me)\s+(about|information|data)\s+(states|counties)\b/.test(command)) {
    return 'general_ambiguous';
  } else {
    return 'general_ambiguous';
  }
};

/**
 * Get available data types for help messages
 * @returns {Object} Object describing available data types
 */
const getAvailableDataTypes = () => {
  return {
    population: 'Population data (in millions)',
    crime_rates: 'Crime rates (as percentages)',
    income: 'Income data (in thousands of dollars)',
    unemployment: 'Unemployment rates (as percentages)',
    land_area: 'Land area (in thousands of square miles)'
  };
};

/**
 * Handle ambiguous queries by generating helpful clarification responses
 * @param {string} command - The ambiguous command
 * @returns {Object} Clarification response object
 */
const handleAmbiguousQuery = (command) => {
  console.log('Handling ambiguous query:', command);
  
  const category = categorizeAmbiguousQuery(command);
  let clarificationMessage = '';
  let suggestions = [];
  
  switch (category) {
    case 'vague_qualitative':
      clarificationMessage = "I'd be happy to help you find states! What makes a state 'good' or 'best' for you?";
      suggestions = [
        'Show states with high income',
        'Find states with low crime rates',
        'Highlight states with low unemployment',
        'Show states with large populations',
        'Find states with small land area'
      ];
      break;
      
    case 'missing_data_type':
      clarificationMessage = "I can show you states with high or low values. Which data would you like to see?";
      suggestions = [
        'Show states with high population',
        'Find states with low crime rates',
        'Highlight states with high income',
        'Show states with low unemployment',
        'Find states with large land area'
      ];
      break;
      
    case 'incomplete_ranking':
      clarificationMessage = "I can show you top or bottom states by different metrics. What would you like to rank by?";
      suggestions = [
        'Show top 5 states by population',
        'Find bottom 3 states by crime rates',
        'Show top 10 states by income',
        'Find states with lowest unemployment',
        'Show largest states by land area'
      ];
      break;
      
    case 'comparison_request':
      clarificationMessage = "I can help you compare states! What would you like to compare?";
      suggestions = [
        'Show states with high income and low crime rates',
        'Find states with large populations but small land area',
        'Compare states with high income vs high crime rates',
        'Show states with low unemployment and high income'
      ];
      break;
      
    case 'help_request':
      clarificationMessage = "I can help you explore US state data! Here are some things you can ask:";
      suggestions = [
        'Show heatmap of population',
        'Find states with high income',
        'Show top 5 states by land area',
        'Highlight states with low crime rates in red',
        'Show states with high income but not high crime rates'
      ];
      break;
      
    default:
      clarificationMessage = "I'm not sure exactly what you're looking for. Here are some examples of what I can do:";
      suggestions = [
        'Show heatmap of crime rates',
        'Find states with population over 20 million',
        'Show top 5 states with highest income in blue',
        'Highlight states with low unemployment',
        'Show states with high income and low crime rates'
      ];
  }
  
  console.log('Generated clarification:', { category, clarificationMessage, suggestions });
  
  return {
    action: 'clarify',
    message: clarificationMessage,
    suggestions: suggestions,
    category: category
  };
};

/**
 * Detects simple highlighting commands before multi-color detection
 * @param {string} command - The command to check
 * @returns {boolean} True if it's a simple highlighting command
 */
const isSimpleHighlightCommand = (command) => {
  // Pattern for "highlight [location] in [color]" (single location)
  // Updated to handle state names with spaces like "new york"
  const singleLocationPatterns = [
    /\bhighlight\s+[\w\s]+\s+in\s+\w+$/,
    /\bshow\s+[\w\s]+\s+in\s+\w+$/,
    /\bdisplay\s+[\w\s]+\s+in\s+\w+$/
  ];
  
  // Pattern for "highlight [location1, location2, location3] in [color]" (multiple locations)
  const multipleLocationPatterns = [
    /\bhighlight\s+[\w\s,]+\s+in\s+\w+$/,
    /\bshow\s+[\w\s,]+\s+in\s+\w+$/,
    /\bdisplay\s+[\w\s,]+\s+in\s+\w+$/
  ];
  
  const isSingleLocation = singleLocationPatterns.some(pattern => pattern.test(command));
  const isMultipleLocation = multipleLocationPatterns.some(pattern => pattern.test(command)) && command.includes(',');
  
  console.log('Simple highlight detection:', {
    command,
    isSingleLocation,
    isMultipleLocation,
    result: isSingleLocation || isMultipleLocation
  });
  
  return isSingleLocation || isMultipleLocation;
};

/**
 * Parses simple highlighting commands
 * @param {string} command - The command to parse
 * @returns {Object} Parsed command result
 */
const parseSimpleHighlightCommand = (command) => {
  console.log('Parsing simple highlight command:', command);
  
  // Check if it's a multiple location command
  const isMultipleLocations = command.includes(',');
  
  if (isMultipleLocations) {
    return parseMultipleLocationHighlight(command);
  } else {
    return parseSingleLocationHighlight(command);
  }
};

// New function for single location highlighting
const parseSingleLocationHighlight = (command) => {
  console.log('Parsing single location highlight:', command);
  
  // Extract location and color - updated to handle state names with spaces
  const match = command.match(/\b(highlight|show|display)\s+([\w\s]+)\s+in\s+(\w+)$/);
  
  if (!match) {
    return { 
      action: 'unknown', 
      suggestion: 'Could not parse single location highlight command' 
    };
  }
  
  const [, action, location, color] = match;
  
  console.log('Extracted single location:', { action, location, color });
  
  // Use existing state name mapping logic
  const locationId = getStateIdFromName(location);
  
  if (!locationId) {
    return { 
      action: 'unknown', 
      suggestion: `Could not find state "${location}". Try using full state names like "texas" or "california"` 
    };
  }
  
  return {
    action: 'simple_highlight',
    targetType: 'state',
    locations: [{ id: locationId, name: location }],
    color: color,
    isMultiple: false
  };
};

// New function for multiple location highlighting
const parseMultipleLocationHighlight = (command) => {
  console.log('Parsing multiple location highlight:', command);
  
  // Extract locations and color using regex
  const match = command.match(/\b(highlight|show|display)\s+(.*?)\s+in\s+(\w+)$/);
  
  if (!match) {
    return { 
      action: 'unknown', 
      suggestion: 'Could not parse multiple location highlight command' 
    };
  }
  
  const [, action, locationsString, color] = match;
  
  console.log('Extracted multiple locations:', { action, locationsString, color });
  
  // Split locations by comma and clean them up
  const locationNames = locationsString
    .split(',')
    .map(loc => loc.trim())
    .filter(loc => loc.length > 0);
  
  console.log('Parsed location names:', locationNames);
  
  // Map each location name to its ID
  const locations = [];
  const invalidLocations = [];
  
  for (const locationName of locationNames) {
    const locationId = getStateIdFromName(locationName);
    if (locationId) {
      locations.push({ id: locationId, name: locationName });
    } else {
      invalidLocations.push(locationName);
    }
  }
  
  console.log('Valid locations:', locations);
  console.log('Invalid locations:', invalidLocations);
  
  if (locations.length === 0) {
    return { 
      action: 'unknown', 
      suggestion: `Could not find any valid states in "${locationsString}". Try using full state names like "texas, california, florida"` 
    };
  }
  
  if (invalidLocations.length > 0) {
    console.warn(`Some locations were not recognized: ${invalidLocations.join(', ')}`);
  }
  
  return {
    action: 'simple_highlight',
    targetType: 'state',
    locations: locations,
    color: color,
    isMultiple: true,
    invalidLocations: invalidLocations
  };
};

// Helper function to get state ID from name
const getStateIdFromName = (locationName) => {
  // Map common state names to FIPS codes
  const stateNameToFips = {
    'texas': '48',
    'california': '06',
    'florida': '12',
    'newyork': '36',
    'new york': '36',
    'illinois': '17',
    'ohio': '39',
    'georgia': '13',
    'michigan': '26',
    'arizona': '04',
    'virginia': '51',
    'alaska': '02',
    'alabama': '01',
    'arkansas': '05',
    'colorado': '08',
    'connecticut': '09',
    'delaware': '10',
    'hawaii': '15',
    'idaho': '16',
    'indiana': '18',
    'iowa': '19',
    'kansas': '20',
    'kentucky': '21',
    'louisiana': '22',
    'maine': '23',
    'maryland': '24',
    'massachusetts': '25',
    'minnesota': '27',
    'mississippi': '28',
    'missouri': '29',
    'montana': '30',
    'nebraska': '31',
    'nevada': '32',
    'newhampshire': '33',
    'newjersey': '34',
    'newmexico': '35',
    'northcarolina': '37',
    'northdakota': '38',
    'oklahoma': '40',
    'oregon': '41',
    'pennsylvania': '42',
    'rhodeisland': '44',
    'southcarolina': '45',
    'southdakota': '46',
    'tennessee': '47',
    'utah': '49',
    'vermont': '50',
    'washington': '53',
    'westvirginia': '54',
    'wisconsin': '55',
    'wyoming': '56'
  };
  
  // Normalize location name (lowercase, handle spaces)
  const normalizedLocation = locationName.toLowerCase().trim();
  return stateNameToFips[normalizedLocation];
}; 