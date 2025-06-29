// Test file for multiple location highlighting functionality
import { interpretCommand } from './src/utils/mockLLM.js';

// Test commands for multiple location highlighting
const testCommands = [
  // Single location commands (should continue to work)
  "highlight texas in red",
  "show california in blue",
  "display florida in green",
  
  // Multiple location commands (new functionality)
  "highlight new york, california, alaska in red",
  "show texas, florida, ohio in blue",
  "display california, new york, texas in green",
  
  // Mixed valid/invalid locations
  "highlight california, invalidstate, texas in blue",
  "show new york, nonexistent, florida in red",
  
  // Edge cases
  "highlight new york,california,alaska in red", // No spaces after commas
  "highlight new york , california , alaska in red", // Extra spaces
  "highlight new york, california, alaska in purple", // Different color
];

console.log('=== Testing Multiple Location Highlighting ===');

testCommands.forEach((command, index) => {
  console.log(`\nTest ${index + 1}: "${command}"`);
  const result = interpretCommand(command);
  console.log('Result:', result);
  
  if (result.action === 'simple_highlight') {
    console.log('✓ Simple highlight command detected correctly');
    console.log(`  - Target Type: ${result.targetType}`);
    console.log(`  - Color: ${result.color}`);
    console.log(`  - Is Multiple: ${result.isMultiple}`);
    console.log(`  - Locations: ${result.locations.map(l => `${l.name} (${l.id})`).join(', ')}`);
    if (result.invalidLocations && result.invalidLocations.length > 0) {
      console.log(`  - Invalid Locations: ${result.invalidLocations.join(', ')}`);
    }
  } else {
    console.log('✗ Simple highlight command not detected');
    if (result.suggestion) {
      console.log(`  - Suggestion: ${result.suggestion}`);
    }
  }
});

console.log('\n=== Testing Complete ==='); 