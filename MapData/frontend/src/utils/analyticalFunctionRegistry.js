import {
  calculateMean,
  calculateMedian,
  calculateSum,
  calculateStandardDeviation,
  calculateVariance,
  calculateCorrelation,
  calculateQuartiles,
  calculateMin,
  calculateMax,
  calculateRange,
  calculateSummaryStatistics
} from './statisticsUtils.js';

// Registry of analytical functions available for natural language queries
export const analyticalFunctionRegistry = {
  // Basic descriptive statistics
  mean: {
    func: calculateMean,
    name: 'mean',
    aliases: ['average', 'avg'],
    description: 'Calculate the arithmetic mean (average) of a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'number',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me the mean of population',
      'calculate average income',
      'what is the average crime rate'
    ]
  },

  median: {
    func: calculateMedian,
    name: 'median',
    aliases: ['middle', 'mid'],
    description: 'Calculate the median (middle value) of a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'number',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me the median population',
      'calculate median income',
      'what is the median crime rate'
    ]
  },

  sum: {
    func: calculateSum,
    name: 'sum',
    aliases: ['total', 'add'],
    description: 'Calculate the sum (total) of all values in a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'number',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me the total population',
      'calculate sum of income',
      'what is the total crime rate'
    ]
  },

  standardDeviation: {
    func: calculateStandardDeviation,
    name: 'standardDeviation',
    aliases: ['std', 'stdev', 'standard deviation'],
    description: 'Calculate the standard deviation (measure of spread) of a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'number',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me the standard deviation of population',
      'calculate std of income',
      'what is the standard deviation of crime rates'
    ]
  },

  variance: {
    func: calculateVariance,
    name: 'variance',
    aliases: ['var'],
    description: 'Calculate the variance (measure of spread) of a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'number',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me the variance of population',
      'calculate variance of income',
      'what is the variance of crime rates'
    ]
  },

  min: {
    func: calculateMin,
    name: 'min',
    aliases: ['minimum', 'lowest', 'smallest'],
    description: 'Find the minimum (smallest) value in a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'number',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me the minimum population',
      'what is the lowest income',
      'find the smallest crime rate'
    ]
  },

  max: {
    func: calculateMax,
    name: 'max',
    aliases: ['maximum', 'highest', 'largest'],
    description: 'Find the maximum (largest) value in a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'number',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me the maximum population',
      'what is the highest income',
      'find the largest crime rate'
    ]
  },

  range: {
    func: calculateRange,
    name: 'range',
    aliases: ['spread'],
    description: 'Calculate the range (difference between max and min) of a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'number',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me the range of population',
      'calculate range of income',
      'what is the range of crime rates'
    ]
  },

  // Correlation analysis
  correlation: {
    func: calculateCorrelation,
    name: 'correlation',
    aliases: ['corr', 'relationship', 'association'],
    description: 'Calculate the correlation coefficient between two datasets (measures linear relationship)',
    category: 'relationship',
    inputType: 'dual_dataset',
    outputType: 'number',
    parameters: {
      datasetX: {
        type: 'array',
        description: 'First dataset (array of numeric values)',
        required: true
      },
      datasetY: {
        type: 'array',
        description: 'Second dataset (array of numeric values)',
        required: true
      }
    },
    examples: [
      'show correlation between income and crime rates',
      'calculate correlation of population and unemployment',
      'what is the relationship between income and population'
    ]
  },

  // Quartiles and percentiles
  quartiles: {
    func: calculateQuartiles,
    name: 'quartiles',
    aliases: ['q1 q2 q3', 'quarters'],
    description: 'Calculate the quartiles (25th, 50th, 75th percentiles) of a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'object',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me the quartiles of population',
      'calculate quartiles of income',
      'what are the quartiles of crime rates'
    ]
  },

  // Comprehensive summary
  summary: {
    func: calculateSummaryStatistics,
    name: 'summary',
    aliases: ['summarize', 'describe', 'stats', 'statistics'],
    description: 'Calculate comprehensive summary statistics for a dataset',
    category: 'descriptive',
    inputType: 'single_dataset',
    outputType: 'object',
    parameters: {
      dataset: {
        type: 'array',
        description: 'Array of numeric values',
        required: true
      }
    },
    examples: [
      'show me summary statistics for population',
      'summarize income data',
      'describe crime rate statistics'
    ]
  }
};

// Helper functions for registry operations
export const getFunctionByName = (name) => {
  const normalizedName = name.toLowerCase();
  
  // Direct name match
  if (analyticalFunctionRegistry[normalizedName]) {
    return analyticalFunctionRegistry[normalizedName];
  }
  
  // Alias match
  for (const [key, funcInfo] of Object.entries(analyticalFunctionRegistry)) {
    if (funcInfo.aliases.some(alias => alias.toLowerCase() === normalizedName)) {
      return funcInfo;
    }
  }
  
  return null;
};

export const getFunctionsByCategory = (category) => {
  return Object.entries(analyticalFunctionRegistry)
    .filter(([, funcInfo]) => funcInfo.category === category)
    .reduce((acc, [key, funcInfo]) => {
      acc[key] = funcInfo;
      return acc;
    }, {});
};

export const getAllFunctionNames = () => {
  const names = [];
  Object.entries(analyticalFunctionRegistry).forEach(([key, funcInfo]) => {
    names.push(funcInfo.name);
    names.push(...funcInfo.aliases);
  });
  return names;
};

export const searchFunctions = (query) => {
  const normalizedQuery = query.toLowerCase();
  const results = [];
  
  Object.entries(analyticalFunctionRegistry).forEach(([key, funcInfo]) => {
    // Search in name, aliases, description, and examples
    const searchText = [
      funcInfo.name,
      ...funcInfo.aliases,
      funcInfo.description,
      ...funcInfo.examples
    ].join(' ').toLowerCase();
    
    if (searchText.includes(normalizedQuery)) {
      results.push({
        key,
        ...funcInfo,
        relevance: funcInfo.name.toLowerCase() === normalizedQuery ? 10 : 
                  funcInfo.aliases.some(alias => alias.toLowerCase() === normalizedQuery) ? 8 :
                  funcInfo.name.toLowerCase().includes(normalizedQuery) ? 6 : 4
      });
    }
  });
  
  // Sort by relevance
  return results.sort((a, b) => b.relevance - a.relevance);
};

// Function to get available data types for analytical functions
export const getAvailableDataTypes = () => {
  return [
    'population',
    'crime_rates', 
    'income',
    'unemployment',
    'land_area'
  ];
};

// Function to validate if a data type is available
export const isValidDataType = (dataType) => {
  return getAvailableDataTypes().includes(dataType);
};

// Test function to verify registry functionality
export const testAnalyticalRegistry = () => {
  console.log('=== Testing Analytical Function Registry ===');
  
  try {
    // Test function lookup
    console.log('Testing function lookup:');
    const meanFunc = getFunctionByName('mean');
    console.log('Mean function found:', meanFunc ? '✅' : '❌');
    
    const avgFunc = getFunctionByName('average'); // alias test
    console.log('Average (alias) function found:', avgFunc ? '✅' : '❌');
    
    // Test category filtering
    console.log('\nTesting category filtering:');
    const descriptiveFunctions = getFunctionsByCategory('descriptive');
    console.log('Descriptive functions count:', Object.keys(descriptiveFunctions).length);
    
    const relationshipFunctions = getFunctionsByCategory('relationship');
    console.log('Relationship functions count:', Object.keys(relationshipFunctions).length);
    
    // Test search functionality
    console.log('\nTesting search functionality:');
    const correlationSearch = searchFunctions('correlation');
    console.log('Correlation search results:', correlationSearch.length);
    
    const averageSearch = searchFunctions('average');
    console.log('Average search results:', averageSearch.length);
    
    // Test data type validation
    console.log('\nTesting data type validation:');
    console.log('Population is valid:', isValidDataType('population') ? '✅' : '❌');
    console.log('Invalid type is valid:', isValidDataType('invalid') ? '❌' : '✅');
    
    // List all available functions
    console.log('\nAvailable analytical functions:');
    Object.entries(analyticalFunctionRegistry).forEach(([key, funcInfo]) => {
      console.log(`- ${funcInfo.name} (${funcInfo.category}): ${funcInfo.description}`);
    });
    
    console.log('\n✅ Analytical Function Registry test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Analytical Function Registry test failed:', error);
    return false;
  }
}; 