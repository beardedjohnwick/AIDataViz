import { useState, useCallback } from 'react';

/**
 * Custom hook for managing map layer controls
 * @returns {Object} - Layer control state and handlers
 */
const useLayerControls = () => {
  const [showCounties, setShowCounties] = useState(false);

  // Toggle county layer visibility
  const toggleCounties = useCallback(() => {
    setShowCounties(prevState => !prevState);
  }, []);

  return {
    showCounties,
    toggleCounties
  };
};

export default useLayerControls; 