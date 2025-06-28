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
  
  // Check for heat map commands
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
  
  // Default case for unknown commands
  return {
    action: 'unknown'
  };
} 