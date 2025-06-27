import React, { useCallback, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { debounce } from 'lodash';

/**
 * Component to handle zoom events
 * @param {Object} props - Component props
 * @param {Function} props.setZoomLevel - Function to set zoom level
 * @param {Function} props.onZoomEnd - Function to call when zoom ends
 * @returns {null} This component doesn't render anything
 */
export const ZoomHandler = ({ setZoomLevel, onZoomEnd }) => {
  const mapEvents = useMapEvents({
    zoomend: () => {
      const currentZoom = mapEvents.getZoom();
      setZoomLevel(currentZoom);
      
      if (onZoomEnd) {
        onZoomEnd(currentZoom, mapEvents.getBounds());
      }
    }
  });
  
  return null;
};

/**
 * Component to handle map reference and movement events
 * @param {Object} props - Component props
 * @param {Object} props.mapRef - Reference to store map instance
 * @param {Function} props.onMoveEnd - Function to call when map movement ends
 * @param {boolean} props.enableDataLoading - Whether to enable data loading on map events
 * @returns {null} This component doesn't render anything
 */
export const MapController = ({ mapRef, onMoveEnd, enableDataLoading = true }) => {
  const map = useMapEvents({
    moveend: () => {
      if (enableDataLoading && onMoveEnd) {
        const bounds = map.getBounds();
        const zoom = map.getZoom();
        onMoveEnd(zoom, bounds);
      }
    }
  });
  
  // Store the map reference
  mapRef.current = map;
  
  return null;
};

/**
 * Component that handles viewport changes and triggers data loading
 * @param {Object} props - Component props
 * @param {Object} props.mapRef - Reference to the map instance
 * @param {Function} props.loadStatesData - Function to load states data
 * @param {Function} props.loadCountiesData - Function to load counties data
 * @param {boolean} props.countyToggle - Whether counties are toggled on
 * @param {number} props.zoomLevel - Current zoom level
 * @returns {null} This component doesn't render anything
 */
export const ViewportHandler = ({ 
  mapRef, 
  loadStatesData, 
  loadCountiesData, 
  countyToggle, 
  zoomLevel 
}) => {
  // Debounced data loading functions to prevent excessive API calls
  const debouncedLoadStates = useCallback(
    debounce((bounds) => {
      if (!mapRef.current) return;
      
      loadStatesData({
        zoomLevel,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        }
      });
    }, 300),
    [loadStatesData, zoomLevel, mapRef]
  );
  
  const debouncedLoadCounties = useCallback(
    debounce((bounds) => {
      if (!mapRef.current || !countyToggle) return;
      
      // Only load counties at zoom level 6 or higher
      if (zoomLevel >= 6) {
        loadCountiesData(true, {
          zoomLevel,
          bounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          }
        });
      }
    }, 500),
    [loadCountiesData, zoomLevel, countyToggle, mapRef]
  );
  
  // Handle map movement
  const handleMapMoveEnd = useCallback((zoom, bounds) => {
    debouncedLoadStates(bounds);
    debouncedLoadCounties(bounds);
  }, [debouncedLoadStates, debouncedLoadCounties]);
  
  // Handle zoom end separately to adjust detail level
  const handleZoomEnd = useCallback((zoom, bounds) => {
    // Force refresh on zoom to get appropriate detail level
    if (mapRef.current) {
      loadStatesData({
        zoomLevel: zoom,
        bounds: {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        },
        forceRefresh: true
      });
      
      // Only load counties at zoom level 6 or higher
      if (countyToggle && zoom >= 6) {
        loadCountiesData(true, {
          zoomLevel: zoom,
          bounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          },
          forceRefresh: true
        });
      }
    }
  }, [loadStatesData, loadCountiesData, countyToggle, mapRef]);
  
  return (
    <>
      <ZoomHandler setZoomLevel={() => {}} onZoomEnd={handleZoomEnd} />
      <MapController mapRef={mapRef} onMoveEnd={handleMapMoveEnd} />
    </>
  );
}; 