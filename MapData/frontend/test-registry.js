// Test file for analytical function registry
import { 
  testAnalyticalRegistry, 
  analyticalFunctionRegistry,
  getFunctionByName,
  getFunctionsByCategory,
  searchFunctions,
  isValidDataType
} from './src/utils/analyticalFunctionRegistry.js';

console.log('Testing Analytical Function Registry...');

// Run the comprehensive test
const success = testAnalyticalRegistry();

if (success) {
  console.log('\n=== Manual Tests ===');
  
  // Test function lookup
  console.log('Testing function lookup:');
  const meanFunc = getFunctionByName('mean');
  console.log('Mean function:', meanFunc ? meanFunc.name : 'Not found');
  
  const avgFunc = getFunctionByName('average');
  console.log('Average function (alias):', avgFunc ? avgFunc.name : 'Not found');
  
  // Test category filtering
  console.log('\nTesting categories:');
  const descriptive = getFunctionsByCategory('descriptive');
  console.log('Descriptive functions:', Object.keys(descriptive).length);
  
  const relationship = getFunctionsByCategory('relationship');
  console.log('Relationship functions:', Object.keys(relationship).length);
  
  // Test search
  console.log('\nTesting search:');
  const searchResults = searchFunctions('correlation');
  console.log('Search for "correlation":', searchResults.length, 'results');
  
  // Test data type validation
  console.log('\nTesting data types:');
  console.log('Population valid:', isValidDataType('population'));
  console.log('Invalid type valid:', isValidDataType('invalid'));
  
  console.log('\n✅ All tests passed!');
} else {
  console.log('❌ Tests failed!');
} 