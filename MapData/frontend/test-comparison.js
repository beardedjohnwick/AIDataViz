// Test file for comparison functionality
import { interpretCommand } from './src/utils/mockLLM.js';

// Test comparison commands - including the problematic one
const testCommands = [
  "highlight states where population is greater than land area", // This was failing
  "show states where income is higher than crime rates",
  "find states where crime rates are lower than unemployment",
  "show states where land area is larger than population",
  "highlight states where unemployment is lower than crime rates"
];

console.log('=== Testing Comparison Commands ===');

testCommands.forEach((command, index) => {
  console.log(`\nTest ${index + 1}: "${command}"`);
  const result = interpretCommand(command);
  console.log('Result:', result);
  
  if (result.action === 'comparison') {
    console.log('✓ Comparison command detected correctly');
    console.log(`  - Target Type: ${result.targetType}`);
    console.log(`  - First Metric: ${result.firstMetric}`);
    console.log(`  - Second Metric: ${result.secondMetric}`);
    console.log(`  - Operator: ${result.operator}`);
  } else {
    console.log('✗ Comparison command not detected');
    if (result.suggestion) {
      console.log(`  - Suggestion: ${result.suggestion}`);
    }
  }
});

console.log('\n=== Test Complete ==='); 