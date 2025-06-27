/**
 * Demo script for testing Alaska transformation functionality
 * 
 * This script provides examples of how to use the Alaska transformation API.
 * To use this script, import it in your application or run it in the browser console.
 */

import { ALASKA_CONFIG } from './geoUtils';

// Wait for the map component to initialize
const waitForAlaskaTransform = () => {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (window.alaskaTransform) {
        clearInterval(checkInterval);
        resolve(window.alaskaTransform);
      }
    }, 100);
  });
};

// Demo function that showcases different Alaska transformations
const runAlaskaTransformDemo = async () => {
  console.log('Starting Alaska transformation demo...');
  
  // Wait for the Alaska transform API to be available
  const alaskaTransform = await waitForAlaskaTransform();
  
  // Store initial transformation values
  const initialTransform = alaskaTransform.getTransformation();
  console.log('Initial Alaska transformation:', initialTransform);
  
  // Demo sequence
  const demoSteps = [
    {
      name: 'Scale Alaska to 0.5x',
      transform: { 
        scale: 0.5, 
        scaleY: 0.7,
        translateX: ALASKA_CONFIG.defaults.translateX, 
        translateY: ALASKA_CONFIG.defaults.translateY 
      },
      delay: 2000
    },
    {
      name: 'Move Alaska right',
      transform: { 
        scale: 0.5, 
        scaleY: 0.7,
        translateX: ALASKA_CONFIG.defaults.translateX + 15, 
        translateY: ALASKA_CONFIG.defaults.translateY 
      },
      delay: 2000
    },
    {
      name: 'Move Alaska up and adjust scale',
      transform: { 
        scale: 0.4, 
        scaleY: 0.6,
        translateX: ALASKA_CONFIG.defaults.translateX + 15, 
        translateY: ALASKA_CONFIG.defaults.translateY - 15 
      },
      delay: 2000
    },
    {
      name: 'Reset to default',
      transform: { 
        scale: ALASKA_CONFIG.defaults.scale, 
        scaleY: ALASKA_CONFIG.defaults.scaleY,
        translateX: ALASKA_CONFIG.defaults.translateX, 
        translateY: ALASKA_CONFIG.defaults.translateY 
      },
      delay: 1000
    }
  ];
  
  // Run each demo step
  for (const step of demoSteps) {
    console.log(`Demo: ${step.name}`);
    alaskaTransform.setTransformation(
      step.transform.scale, 
      step.transform.translateX, 
      step.transform.translateY,
      step.transform.scaleY
    );
    
    // Wait for the specified delay
    await new Promise(resolve => setTimeout(resolve, step.delay));
  }
  
  console.log('Alaska transformation demo complete!');
};

// Export the demo functions
export const alaskaTransformDemo = {
  run: runAlaskaTransformDemo,
  wait: waitForAlaskaTransform
};

// If this script is loaded directly in the browser, run the demo
if (typeof window !== 'undefined' && window.location) {
  // Add a button to the page to run the demo
  const addDemoButton = () => {
    // Check if button already exists
    if (document.getElementById('alaska-transform-demo-button')) {
      return;
    }
    
    const button = document.createElement('button');
    button.id = 'alaska-transform-demo-button';
    button.textContent = 'Run Alaska Transform Demo';
    button.style.position = 'absolute';
    button.style.top = '50px';
    button.style.left = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#2196F3';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    button.addEventListener('click', runAlaskaTransformDemo);
    
    document.body.appendChild(button);
  };
  
  // Add the demo button when the DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    addDemoButton();
  } else {
    document.addEventListener('DOMContentLoaded', addDemoButton);
  }
}

export default alaskaTransformDemo; 