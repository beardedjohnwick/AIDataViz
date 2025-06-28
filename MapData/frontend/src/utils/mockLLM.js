/**
 * Mock LLM implementation that simulates natural language processing
 * by interpreting specific map commands and returning structured actions.
 * 
 * This is a simple implementation that only understands a few specific commands.
 * In a real application, this would be replaced with an actual LLM API call.
 */

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
    action: 'unknown'
  };
} 