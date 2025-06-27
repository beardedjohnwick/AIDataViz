# React Component Standards for MapData Project

## Overview

This document outlines the standards and best practices for React components in the MapData project, with a focus on performance, modularity, and maintainability.

## Component Organization

### Directory Structure

```
src/
├── components/
│   ├── common/              # Reusable components across features
│   │   ├── Button/
│   │   │   ├── Button.js
│   │   │   ├── Button.test.js
│   │   │   └── Button.module.css
│   │   └── ...
│   ├── features/            # Feature-specific components
│   │   ├── Map/
│   │   │   ├── MapContainer.js
│   │   │   ├── MapLayers/
│   │   │   │   ├── StateLayer.js
│   │   │   │   └── ...
│   │   │   ├── MapControls/
│   │   │   │   ├── ZoomControl.js
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   └── layout/              # Layout components
│       ├── Header/
│       ├── Sidebar/
│       └── ...
├── hooks/                   # Custom React hooks
├── services/                # API and data services
├── utils/                   # Utility functions
└── context/                 # React context definitions
```

### Component File Structure

Each component should be organized as follows:

```jsx
// 1. Imports
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './ComponentName.module.css';

// 2. Component definition
const ComponentName = ({ prop1, prop2, children }) => {
  // 3. Hooks
  const [state, setState] = useState(initialState);
  
  // 4. Memoized values
  const memoizedValue = useMemo(() => {
    return computeExpensiveValue(prop1, prop2);
  }, [prop1, prop2]);
  
  // 5. Callbacks
  const handleEvent = useCallback(() => {
    // Handle event
  }, [/* dependencies */]);
  
  // 6. Effects
  useEffect(() => {
    // Side effect
    return () => {
      // Cleanup
    };
  }, [/* dependencies */]);
  
  // 7. Helper functions
  const helperFunction = () => {
    // Helper logic
  };
  
  // 8. Render logic (conditional rendering, etc.)
  if (!prop1) {
    return <div>Loading...</div>;
  }
  
  // 9. Return JSX
  return (
    <div className={styles.container}>
      {/* JSX content */}
    </div>
  );
};

// 10. PropTypes
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  children: PropTypes.node,
};

// 11. Default props
ComponentName.defaultProps = {
  prop2: 0,
  children: null,
};

// 12. Export
export default React.memo(ComponentName);
```

## Performance Optimization

### Component Memoization

- Use `React.memo()` for components that render often with the same props
- Example:

```jsx
const MapMarker = React.memo(({ position, label }) => {
  return <div style={{ position: 'absolute', left: position.x, top: position.y }}>{label}</div>;
});
```

### Hook Optimization

- Use `useCallback` for event handlers passed as props
- Example:

```jsx
const handleZoomChange = useCallback((newZoom) => {
  setZoom(newZoom);
  onZoomChange(newZoom);
}, [onZoomChange]);
```

- Use `useMemo` for expensive calculations
- Example:

```jsx
const filteredData = useMemo(() => {
  return data.filter(item => item.value > threshold);
}, [data, threshold]);
```

### Dependencies Array Management

- Always specify dependencies for hooks
- Keep dependencies arrays minimal but complete
- Consider using ESLint rules to enforce correct dependencies

### State Management

- Keep state as local as possible
- Lift state up only when necessary
- Use context for deeply shared state
- Consider state machines for complex state logic

## Map-Specific Performance Optimization

### Layer Management

- Only render visible layers
- Implement a layer manager to handle layer visibility based on zoom level
- Example:

```jsx
const MapLayerManager = ({ zoom, children }) => {
  // Filter children based on their minZoom and maxZoom props
  const visibleLayers = React.Children.toArray(children).filter(child => {
    const { minZoom = 0, maxZoom = 20 } = child.props;
    return zoom >= minZoom && zoom <= maxZoom;
  });
  
  return <>{visibleLayers}</>;
};
```

### Geometry Optimization

- Use simplified geometries at lower zoom levels
- Implement level-of-detail rendering
- Example:

```jsx
const StateLayer = ({ zoom }) => {
  const geometryUrl = useMemo(() => {
    if (zoom < 5) return '/api/states/simplified';
    if (zoom < 10) return '/api/states/medium';
    return '/api/states/detailed';
  }, [zoom]);
  
  // Fetch and render geometry
};
```

### Feature Clustering

- Use clustering for dense point data
- Example:

```jsx
const PointClusterLayer = ({ points, clusterRadius }) => {
  const clusters = useMemo(() => {
    return clusterPoints(points, clusterRadius);
  }, [points, clusterRadius]);
  
  return clusters.map(cluster => (
    <ClusterMarker
      key={cluster.id}
      position={cluster.position}
      pointCount={cluster.pointCount}
    />
  ));
};
```

## Component Types

### Presentational Components

- Focus on UI rendering
- Receive data via props
- Don't contain business logic or data fetching
- Example:

```jsx
const StatisticsPanel = ({ title, data, isLoading }) => {
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className={styles.panel}>
      <h2>{title}</h2>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.label}: {item.value}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Container Components

- Handle data fetching and state management
- Pass data to presentational components
- Example:

```jsx
const StatisticsPanelContainer = ({ regionId }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    fetchStatistics(regionId)
      .then(result => {
        setData(result);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  }, [regionId]);
  
  return (
    <StatisticsPanel
      title={`Statistics for Region ${regionId}`}
      data={data}
      isLoading={isLoading}
    />
  );
};
```

### Custom Hooks

- Extract reusable logic into custom hooks
- Follow the `use` prefix naming convention
- Example:

```jsx
function useMapData(regionId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setIsLoading(true);
    fetchMapData(regionId)
      .then(result => {
        setData(result);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, [regionId]);
  
  return { data, isLoading, error };
}
```

## Props Management

### Props Naming Conventions

- Use descriptive prop names
- Use boolean props with `is`, `has`, or `should` prefixes
- Use consistent naming patterns across similar components

### Props Validation

- Always define PropTypes for all components
- Use specific and accurate PropTypes
- Consider using TypeScript for stronger type checking

### Props Spreading

- Avoid spreading unknown props (`{...props}`)
- If needed, explicitly whitelist allowed props:

```jsx
const Button = ({ className, children, onClick, ...rest }) => {
  const allowedProps = filterAllowedProps(rest, ['disabled', 'type', 'name']);
  
  return (
    <button
      className={`${styles.button} ${className}`}
      onClick={onClick}
      {...allowedProps}
    >
      {children}
    </button>
  );
};
```

## Styling

### CSS Modules

- Use CSS Modules for component-scoped styles
- Name CSS files as `[ComponentName].module.css`
- Use semantic class names based on purpose, not appearance

### Responsive Design

- Design components to be responsive by default
- Use relative units (%, em, rem) over absolute units (px)
- Use media queries for breakpoint-specific styling

### Theme Support

- Use CSS variables for themeable properties
- Consider a theme provider for global theme management

## Error Handling

### Error Boundaries

- Implement error boundaries to catch rendering errors
- Example:

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### API Error Handling

- Handle API errors gracefully in components
- Show user-friendly error messages
- Provide retry mechanisms when appropriate

## Testing

### Component Testing

- Write tests for all components
- Test both rendering and behavior
- Example:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Test Coverage Goals

- Aim for 70%+ test coverage for components
- Prioritize testing complex logic and critical user flows

## Accessibility

### Basic Requirements

- All images should have alt text
- Forms should have proper labels
- Interactive elements should be keyboard accessible
- Use semantic HTML elements

### ARIA Attributes

- Use ARIA attributes when necessary
- Ensure proper focus management
- Test with screen readers

## Documentation

### Component Documentation

- Document component purpose and usage
- Document available props and their types
- Provide usage examples

### Code Comments

- Comment complex logic
- Explain non-obvious decisions
- Use JSDoc style for function documentation

## Appendix: Component Checklist

Before considering a component complete, ensure it meets these criteria:

- [ ] Follows the defined file structure
- [ ] Uses appropriate performance optimizations (memo, useCallback, useMemo)
- [ ] Has complete PropTypes definitions
- [ ] Handles loading and error states
- [ ] Is accessible
- [ ] Has tests
- [ ] Is properly documented
- [ ] Follows styling conventions
- [ ] Has appropriate error handling 