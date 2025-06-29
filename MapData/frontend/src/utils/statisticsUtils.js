import * as ss from 'simple-statistics';

// Basic descriptive statistics
export const calculateMean = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  return ss.mean(data);
};

export const calculateMedian = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  return ss.median(data);
};

export const calculateSum = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  return ss.sum(data);
};

export const calculateStandardDeviation = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  return ss.standardDeviation(data);
};

export const calculateVariance = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  return ss.variance(data);
};

// Correlation analysis
export const calculateCorrelation = (dataX, dataY) => {
  if (!Array.isArray(dataX) || !Array.isArray(dataY)) {
    throw new Error('Both datasets must be arrays');
  }
  if (dataX.length !== dataY.length) {
    throw new Error('Both datasets must have the same length');
  }
  if (dataX.length === 0) {
    throw new Error('Datasets cannot be empty');
  }
  return ss.sampleCorrelation(dataX, dataY);
};

// Linear regression
export const calculateLinearRegression = (dataPoints) => {
  if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
    throw new Error('Data points must be a non-empty array');
  }
  
  // Validate data points format: [{x: number, y: number}, ...]
  const isValidFormat = dataPoints.every(point => 
    typeof point === 'object' && 
    typeof point.x === 'number' && 
    typeof point.y === 'number'
  );
  
  if (!isValidFormat) {
    throw new Error('Data points must be in format [{x: number, y: number}, ...]');
  }
  
  return ss.linearRegression(dataPoints);
};

// Percentiles and quartiles
export const calculatePercentile = (data, percentile) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  if (typeof percentile !== 'number' || percentile < 0 || percentile > 1) {
    throw new Error('Percentile must be a number between 0 and 1');
  }
  return ss.quantile(data, percentile);
};

export const calculateQuartiles = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  return {
    q1: ss.quantile(data, 0.25),
    q2: ss.quantile(data, 0.5), // median
    q3: ss.quantile(data, 0.75)
  };
};

// Min and Max
export const calculateMin = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  return ss.min(data);
};

export const calculateMax = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  return ss.max(data);
};

// Range
export const calculateRange = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  return ss.max(data) - ss.min(data);
};

// Comprehensive summary statistics
export const calculateSummaryStatistics = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }
  
  return {
    count: data.length,
    mean: calculateMean(data),
    median: calculateMedian(data),
    sum: calculateSum(data),
    min: calculateMin(data),
    max: calculateMax(data),
    range: calculateRange(data),
    standardDeviation: calculateStandardDeviation(data),
    variance: calculateVariance(data),
    quartiles: calculateQuartiles(data)
  };
};

// Utility function to convert object data to arrays for analysis
export const extractDataArrayFromObject = (dataObject, valueKey = null) => {
  if (typeof dataObject !== 'object' || dataObject === null) {
    throw new Error('Data must be an object');
  }
  
  const values = Object.values(dataObject);
  
  if (valueKey) {
    // If valueKey is specified, extract that property from each value
    return values.map(item => {
      if (typeof item === 'object' && item !== null && valueKey in item) {
        return item[valueKey];
      }
      throw new Error(`Property '${valueKey}' not found in data item`);
    });
  }
  
  // Otherwise, assume values are already numbers
  const numericValues = values.filter(val => typeof val === 'number');
  
  if (numericValues.length === 0) {
    throw new Error('No numeric values found in data object');
  }
  
  return numericValues;
};

// Test function to verify library integration
export const testStatisticsLibrary = () => {
  console.log('=== Testing Statistics Library Integration ===');
  
  try {
    // Test data
    const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const testDataX = [1, 2, 3, 4, 5];
    const testDataY = [2, 4, 6, 8, 10];
    
    // Test basic statistics
    console.log('Test Data:', testData);
    console.log('Mean:', calculateMean(testData));
    console.log('Median:', calculateMedian(testData));
    console.log('Sum:', calculateSum(testData));
    console.log('Standard Deviation:', calculateStandardDeviation(testData));
    console.log('Min:', calculateMin(testData));
    console.log('Max:', calculateMax(testData));
    console.log('Range:', calculateRange(testData));
    
    // Test correlation
    console.log('\nCorrelation Test:');
    console.log('Data X:', testDataX);
    console.log('Data Y:', testDataY);
    console.log('Correlation:', calculateCorrelation(testDataX, testDataY));
    
    // Test summary statistics
    console.log('\nSummary Statistics:');
    const summary = calculateSummaryStatistics(testData);
    console.log(summary);
    
    // Test with mock data format
    console.log('\nTesting with Mock Data Format:');
    const mockData = { '06': 39.5, '48': 29.1, '12': 21.5, '36': 19.8 };
    const extractedArray = extractDataArrayFromObject(mockData);
    console.log('Extracted Array:', extractedArray);
    console.log('Mean of Mock Data:', calculateMean(extractedArray));
    
    console.log('\n✅ Statistics library integration test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Statistics library integration test failed:', error);
    return false;
  }
}; 