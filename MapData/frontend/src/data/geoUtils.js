import { feature } from 'topojson-client';

// Convert TopoJSON to GeoJSON for states
export const convertTopoToGeoStates = (topoData) => {
  if (!topoData) return null;
  return feature(topoData, topoData.objects.states);
};

// Convert TopoJSON to GeoJSON for counties
export const convertTopoToGeoCounties = (topoData) => {
  if (!topoData) return null;
  return feature(topoData, topoData.objects.counties);
}; 