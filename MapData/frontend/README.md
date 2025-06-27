# MapData Frontend

This is the frontend for the MapData application, which displays an interactive map of US states and counties.

## Features

- Interactive map displaying US states and counties
- Alaska and Hawaii are repositioned and scaled to fit within the map viewport
- Toggle for showing/hiding county boundaries
- Hover effects with tooltips showing state/county names
- Click-to-zoom functionality for states and counties
- Smooth transitions and animations

## Project Structure

- `src/components/`: React components for the UI
  - `MapComponent.js`: Main map component
  - `MapControls.js`: Controls for toggling map layers
  - `MapTooltip.js`: Tooltip component for hover information
  - `MapStyles.css`: CSS styles for the map

- `src/hooks/`: Custom React hooks
  - `useMapData.js`: Hook for fetching and managing map data
  - `useMapInteractions.js`: Hook for handling map interactions
  - `useLayerControls.js`: Hook for managing layer controls

- `src/utils/`: Utility functions
  - `transformGeometry.js`: Functions for transforming Alaska and Hawaii

## Getting Started

1. Make sure the backend API is running
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Map Component Design

The map component is designed to be clean, modular, and efficient:

- Uses Leaflet.js for map rendering
- Implements custom hooks for separation of concerns
- Transforms Alaska and Hawaii to fit within the viewport
- Provides intuitive hover and click interactions
- Optimizes data loading by fetching counties only when needed

## API Integration

The map component fetches geographic data from the backend API:
- States: `/api/v1/geographic/states`
- Counties: `/api/v1/geographic/counties`

## Styling

The map uses a minimalist design with:
- White background (no tile layers)
- Thin borders for states and counties
- Light grey hover effect
- Simple tooltip for displaying names 