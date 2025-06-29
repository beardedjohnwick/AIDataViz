// Test file for statistics library integration
import { 
  calculateMean, 
  calculateMedian, 
  calculateSum, 
  calculateStandardDeviation,
  calculateCorrelation,
  calculateSummaryStatistics,
  extractDataArrayFromObject,
  testStatisticsLibrary 
} from './src/utils/statisticsUtils.js';

console.log('=== Manual Statistics Library Test ===');

// Test basic functions
const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('Test Data:', testData);
console.log('Mean:', calculateMean(testData));
console.log('Median:', calculateMedian(testData));
console.log('Sum:', calculateSum(testData));
console.log('Standard Deviation:', calculateStandardDeviation(testData));

// Test correlation
const dataX = [1, 2, 3, 4, 5];
const dataY = [2, 4, 6, 8, 10];
console.log('Correlation:', calculateCorrelation(dataX, dataY));

// Test summary statistics
const summary = calculateSummaryStatistics(testData);
console.log('Summary Statistics:', summary);

// Test with mock data format (similar to what's used in the app)
const mockData = { '06': 39.5, '48': 29.1, '12': 21.5, '36': 19.8 };
const extractedArray = extractDataArrayFromObject(mockData);
console.log('Extracted Array from Mock Data:', extractedArray);
console.log('Mean of Mock Data:', calculateMean(extractedArray));

// Run the comprehensive test
console.log('\n=== Running Comprehensive Test ===');
testStatisticsLibrary();

console.log('\n✅ All statistics tests completed!'); 