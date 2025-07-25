// Test file for analytical filter functionality
// This file can be used to test the analytical filter commands

// Test commands to try in the application:

console.log('=== Analytical Filter Test Commands ===');
console.log('Try these commands in the map application:');
console.log('');
console.log('1. Basic Mean Filter:');
console.log('   "highlight states where mean income is above 60000"');
console.log('   Expected: California (06), New York (36), Illinois (17) should be highlighted');
console.log('');
console.log('2. Correlation Filter:');
console.log('   "show states in red where correlation of crime and income is above 0.5"');
console.log('   Expected: States with high correlation between crime rates and income should be highlighted in red');
console.log('');
console.log('3. Standard Deviation Filter:');
console.log('   "find counties where standard deviation of crime rates is above 0.2"');
console.log('   Expected: Counties with high variance in crime rates should be highlighted');
console.log('');
console.log('4. Sum Filter:');
console.log('   "highlight states in blue where sum of population and income is below 100000"');
console.log('   Expected: States with low combined population and income should be highlighted in blue');
console.log('');
console.log('5. Multiple Data Types:');
console.log('   "show states where mean of crime rates and unemployment is above 0.1"');
console.log('   Expected: States with high average of crime rates and unemployment should be highlighted');
console.log('');
console.log('6. Color Variations:');
console.log('   "highlight states in green where mean income is above 65000"');
console.log('   "show states in yellow where crime rates are below 0.1"');
console.log('   "find states in orange where population is above 20"');
console.log('');
console.log('7. Different Operators:');
console.log('   "highlight states where income is below 60000"');
console.log('   "show states where crime rates equal 0.15"');
console.log('   "find states where population is greater than 30"');
console.log('');
console.log('Expected Results:');
console.log('- Commands should be parsed as action: "analytical_filter"');
console.log('- Console should show analytical calculations for each state');
console.log('- States meeting the criteria should be highlighted in the specified color');
console.log('- Map should visually update to show the highlighted states');
console.log('- Clear highlights should work to reset the map');
console.log('');
console.log('Debug Information:');
console.log('- Check browser console for detailed parsing and calculation logs');
console.log('- Look for "🔬 Detected analytical filter command" messages');
console.log('- Verify "📊 Analyzing X states using Y" messages');
console.log('- Confirm "🎯 Found X states meeting criteria" messages');
console.log('- Check "✅ Successfully highlighted X states" messages');
console.log('');
console.log('Mock Data Used:');
console.log('- California (06): income=75.2, crime=0.15, pop=39.5, unemp=0.074');
console.log('- Texas (48): income=59.8, crime=0.12, pop=29.1, unemp=0.052');
console.log('- Florida (12): income=55.7, crime=0.10, pop=21.5, unemp=0.048');
console.log('- New York (36): income=68.3, crime=0.08, pop=19.8, unemp=0.063');
console.log('- Pennsylvania (42): income=61.2, crime=0.09, pop=12.8, unemp=0.055');
console.log('- Illinois (17): income=65.9, crime=0.11, pop=12.7, unemp=0.067');
console.log('- Ohio (39): income=56.1, crime=0.07, pop=11.7, unemp=0.049');
console.log('- Georgia (13): income=58.4, crime=0.13, pop=10.6, unemp=0.041');
console.log('- North Carolina (37): income=54.6, crime=0.06, pop=10.4, unemp=0.044');
console.log('- Michigan (26): income=57.3, crime=0.14, pop=10.0, unemp=0.071');
console.log('');
console.log('=== End Test Commands ==='); 