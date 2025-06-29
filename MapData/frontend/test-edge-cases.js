// Test file for edge cases in multiple location highlighting
import { interpretCommand } from './src/utils/mockLLM.js';

// Edge case test commands
const edgeCaseCommands = [
  // All invalid locations
  "highlight invalid1, invalid2, invalid3 in red",
  
  // Empty locations
  "highlight , , in red",
  
  // Single location with spaces
  "highlight new york in red",
  
  // Multiple locations with mixed spacing
  "highlight new york,california, alaska in red",
  "highlight new york ,california , alaska in red",
  
  // Different action verbs
  "show new york, california in blue",
  "display texas, florida in green",
  
  // Different colors
  "highlight california, texas in orange",
  "highlight new york, alaska in pink",
  "highlight florida, ohio in yellow",
];

console.log('=== Testing Edge Cases ===');

edgeCaseCommands.forEach((command, index) => {
  console.log(`\nEdge Case ${index + 1}: "${command}"`);
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
  } else if (result.action === 'unknown') {
    console.log('✗ Command not recognized');
    console.log(`  - Suggestion: ${result.suggestion}`);
  } else {
    console.log('✗ Unexpected action type');
    console.log(`  - Action: ${result.action}`);
  }
});

console.log('\n=== Edge Case Testing Complete ==='); 