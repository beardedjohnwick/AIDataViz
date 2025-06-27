/**
 * Demo script for testing Hawaii transformation functionality
 * 
 * This script provides examples of how to use the Hawaii transformation API.
 * To use this script, import it in your application or run it in the browser console.
 */

import { HAWAII_CONFIG } from './geoUtils';

// Wait for the map component to initialize
const waitForHawaiiTransform = () => {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (window.hawaiiTransform) {
        clearInterval(checkInterval);
        resolve(window.hawaiiTransform);
      }
    }, 100);
  });
};

// Demo function that showcases different Hawaii transformations
const runHawaiiTransformDemo = async () => {
  console.log('Starting Hawaii transformation demo...');
  
  // Wait for the Hawaii transform API to be available
  const hawaiiTransform = await waitForHawaiiTransform();
  
  // Store initial transformation values
  const initialTransform = hawaiiTransform.getTransformation();
  console.log('Initial Hawaii transformation:', initialTransform);
  
  // Demo sequence
  const demoSteps = [
    {
      name: 'Scale Hawaii to 1.5x',
      transform: { 
        scale: 1.5, 
        translateX: HAWAII_CONFIG.defaults.translateX, 
        translateY: HAWAII_CONFIG.defaults.translateY 
      },
      delay: 2000
    },
    {
      name: 'Move Hawaii right',
      transform: { 
        scale: 1.5, 
        translateX: HAWAII_CONFIG.defaults.translateX + 20, 
        translateY: HAWAII_CONFIG.defaults.translateY 
      },
      delay: 2000
    },
    {
      name: 'Move Hawaii up and increase scale',
      transform: { 
        scale: 1.8, 
        translateX: HAWAII_CONFIG.defaults.translateX + 20, 
        translateY: HAWAII_CONFIG.defaults.translateY - 15 
      },
      delay: 2000
    },
    {
      name: 'Reset to default',
      transform: { 
        scale: HAWAII_CONFIG.defaults.scale, 
        translateX: HAWAII_CONFIG.defaults.translateX, 
        translateY: HAWAII_CONFIG.defaults.translateY 
      },
      delay: 1000
    }
  ];
  
  // Run each demo step
  for (const step of demoSteps) {
    console.log(`Demo: ${step.name}`);
    hawaiiTransform.setTransformation(
      step.transform.scale, 
      step.transform.translateX, 
      step.transform.translateY
    );
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, step.delay));
  }
  
  console.log('Hawaii transformation demo complete!');
};

// Export the demo functions
export const hawaiiTransformDemo = {
  run: runHawaiiTransformDemo,
  wait: waitForHawaiiTransform
};

// If this script is loaded directly in the browser, run the demo
if (typeof window !== 'undefined' && window.location) {
  // Add a button to the page to run the demo
  const addDemoButton = () => {
    // Check if button already exists
    if (document.getElementById('hawaii-transform-demo-button')) {
      return;
    }
    
    const button = document.createElement('button');
    button.id = 'hawaii-transform-demo-button';
    button.textContent = 'Run Hawaii Transform Demo';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.left = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', runHawaiiTransformDemo);
    
    document.body.appendChild(button);
  };
  
  // Add the demo button when the DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    addDemoButton();
  } else {
    document.addEventListener('DOMContentLoaded', addDemoButton);
  }
}

export default hawaiiTransformDemo; 