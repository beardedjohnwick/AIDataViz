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
  if (!text) return null;
  
  const lowerText = text.toLowerCase().trim();
  
  // Population variations
  if (/population|pop|people/.test(lowerText)) {
    return 'population';
  }
  
  // Crime rate variations
  if (/crime rate|crime rates|crime/.test(lowerText)) {
    return 'crime_rates';
  }
  
  // Income variations
  if (/income|median income|average income/.test(lowerText)) {
    return 'income';
  }
  
  // Unemployment variations
  if (/unemployment|unemployment rate/.test(lowerText)) {
    return 'unemployment';
  }
  
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
 * Interprets a command string and returns a structured action object
 * @param {string} commandText - The command text to interpret
 * @returns {Object} An action object with the appropriate properties
 */
export function interpretCommand(commandText) {
  // Convert to lowercase for case-insensitive matching
  const command = commandText.toLowerCase();
  
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
      "display counties where unemployment is less than 5%"
    ]
  };
} 