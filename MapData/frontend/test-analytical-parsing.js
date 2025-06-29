// Test file for analytical command parsing
import { interpretCommand, testAnalyticalCommandParsing } from './src/utils/mockLLM.js';

console.log('Testing analytical command parsing...');

// Test individual commands
const testCommands = [
  'calculate mean of population',
  'show correlation between income and crime rates',
  'what is the average unemployment',
  'find median income',
  'get summary statistics for population',
  'calculate standard deviation of crime rates',
  'show me the correlation between population and land area',
  'invalid analytical command'
];

console.log('=== Individual Command Tests ===');
testCommands.forEach(command => {
  console.log(`\nTesting: "${command}"`);
  const result = interpretCommand(command);
  console.log('Result:', result);
});

console.log('\n=== Full Test Suite ===');
testAnalyticalCommandParsing();

console.log('\n✅ All tests completed!'); 