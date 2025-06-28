/**
 * Color utility functions for heat map visualization
 */

/**
 * Generates a color for a heat map based on a value's position within a range
 * @param {number} value - The data value to convert to a color
 * @param {number} minValue - The minimum value in the dataset
 * @param {number} maxValue - The maximum value in the dataset
 * @param {string} colorScheme - Optional color scheme (default: 'blue-red')
 * @returns {string} - A CSS color string (hex format)
 */
export const getHeatmapColor = (value, minValue, maxValue, colorScheme = 'blue-red') => {
  // Normalize the value to a range between 0 and 1
  const normalizedValue = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)));
  
  // Define color schemes
  const colorSchemes = {
    'blue-red': {
      start: [65, 105, 225],  // Royal Blue
      end: [220, 20, 60]      // Crimson
    },
    'green-red': {
      start: [46, 139, 87],   // Sea Green
      end: [220, 20, 60]      // Crimson
    },
    'yellow-red': {
      start: [255, 255, 0],   // Yellow
      end: [220, 20, 60]      // Crimson
    }
  };
  
  // Get the selected color scheme or default to blue-red
  const scheme = colorSchemes[colorScheme] || colorSchemes['blue-red'];
  
  // Interpolate between the start and end colors
  const r = Math.round(scheme.start[0] + normalizedValue * (scheme.end[0] - scheme.start[0]));
  const g = Math.round(scheme.start[1] + normalizedValue * (scheme.end[1] - scheme.start[1]));
  const b = Math.round(scheme.start[2] + normalizedValue * (scheme.end[2] - scheme.start[2]));
  
  // Convert to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Generates a legend for the heatmap with specified number of steps
 * @param {number} minValue - The minimum value in the dataset
 * @param {number} maxValue - The maximum value in the dataset
 * @param {number} steps - Number of steps in the legend
 * @param {string} colorScheme - Color scheme to use
 * @returns {Array} - Array of objects with value and color
 */
export const generateHeatmapLegend = (minValue, maxValue, steps = 5, colorScheme = 'blue-red') => {
  const legend = [];
  const step = (maxValue - minValue) / (steps - 1);
  
  for (let i = 0; i < steps; i++) {
    const value = minValue + (step * i);
    const color = getHeatmapColor(value, minValue, maxValue, colorScheme);
    legend.push({ value: value.toFixed(2), color });
  }
  
  return legend;
}; 