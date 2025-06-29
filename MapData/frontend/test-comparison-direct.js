// Direct test script for comparison functionality
// Run with: node test-comparison-direct.js

// Mock the console.log to capture output
const originalLog = console.log;
const logs = [];

console.log = (...args) => {
  logs.push(args.join(' '));
  originalLog(...args);
};

// Test multiple comparison commands
const testCommands = [
  "highlight states where population is greater than land area",
  "show states where income is higher than crime rates",
  "find states where crime rates are lower than unemployment",
  "show states where land area is larger than population",
  "highlight states where unemployment is lower than crime rates"
];

console.log('=== Testing Multiple Comparison Commands ===');

testCommands.forEach((testCommand, index) => {
  console.log(`\nTest ${index + 1}: "${testCommand}"`);
  
  const command = testCommand.toLowerCase().trim();
  
  // Test the regex patterns
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
      console.log(`  Pattern "${pattern}" matched -> type "${type}"`);
      
      // Avoid duplicates
      if (!foundDataTypes.includes(type)) {
        foundDataTypes.push(type);
      }
    }
  }
  
  console.log('  All found data types:', foundDataTypes);
  
  // Test operator detection
  let operator = null;
  if (command.includes('higher than') || command.includes('greater than') || command.includes('more than') || command.includes('larger than')) {
    operator = 'gt';
  } else if (command.includes('lower than') || command.includes('less than') || command.includes('smaller than')) {
    operator = 'lt';
  }
  
  console.log('  Detected operator:', operator);
  
  // Check if we found both metrics
  if (foundDataTypes.length >= 2) {
    const firstMetric = foundDataTypes[0];
    const secondMetric = foundDataTypes[1];
    console.log('  ✓ SUCCESS: Both metrics found!');
    console.log(`    - First Metric: ${firstMetric}`);
    console.log(`    - Second Metric: ${secondMetric}`);
    console.log(`    - Operator: ${operator}`);
  } else {
    console.log('  ✗ FAILED: Could not find both metrics');
    console.log(`    - Found ${foundDataTypes.length} data types: ${foundDataTypes.join(', ')}`);
  }
});

console.log('\n=== All Tests Complete ===');

// Restore original console.log
console.log = originalLog; 