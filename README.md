# AIDataViz - MapData Project Coding Standards

This repository contains the coding standards and best practices for the MapData project, a full-stack application for visualizing geographic and statistical data on US maps.

## Architecture Overview

![Architecture Diagram](architecture_diagram.png)

The MapData application follows a three-tier architecture:

1. **Frontend**: React with Leaflet for map visualization
2. **Backend**: FastAPI (Python) for API endpoints
3. **Database**: PostgreSQL with PostGIS extension for spatial data

## Features

### Geographic Data Visualization
- Interactive map with state and county boundaries
- Hover tooltips displaying geographic information including area in square miles
- Zoom and pan functionality for exploring different regions

### Database Integration
- Integration with Neon PostgreSQL database for dynamic data retrieval
- Automatic fallback to static data if API is unavailable
- See [MapData/backend/NEON_INTEGRATION.md](MapData/backend/NEON_INTEGRATION.md) for setup instructions

## Standards Documentation

This repository contains the following standards documents:

### General Standards

- [CODE_STANDARDS.md](CODE_STANDARDS.md) - Overall coding standards and principles
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architectural guidelines and patterns

### Frontend Standards

- [REACT_COMPONENT_STANDARDS.md](REACT_COMPONENT_STANDARDS.md) - React component design and implementation
- [.eslintrc.js](.eslintrc.js) - ESLint configuration for JavaScript/React
- [.prettierrc](.prettierrc) - Prettier configuration for code formatting

### Backend Standards

- [FASTAPI_STANDARDS.md](FASTAPI_STANDARDS.md) - FastAPI implementation guidelines
- [DATABASE_STANDARDS.md](DATABASE_STANDARDS.md) - PostgreSQL/PostGIS database design and optimization
- [pyproject.toml](pyproject.toml) - Python tooling configuration (Black, isort, mypy, etc.)

## Core Principles

The MapData project adheres to the following core principles:

### 1. Performance Optimization

- Efficient rendering of map components
- Optimized database queries with spatial indexing
- Asynchronous operations for improved concurrency
- Lazy loading and code splitting for reduced bundle sizes

### 2. Modularity and Independence

- Single Responsibility Principle for components and modules
- Clear separation of concerns
- Loose coupling between components
- Feature independence for parallel development

### 3. Code Quality and Maintainability

- Consistent code formatting and style
- Comprehensive documentation
- Robust error handling
- Extensive test coverage

## How to Use These Standards

These standards should be integrated into the development workflow:

1. **IDE Configuration**: Configure your IDE to use the provided linting and formatting rules
2. **Code Reviews**: Reference these standards during code reviews
3. **CI/CD**: Incorporate linting and testing into the CI/CD pipeline
4. **Documentation**: Keep documentation up-to-date as the codebase evolves

## Contributing

When contributing to the MapData project, please ensure your code adheres to these standards. The standards are not static and may evolve over time as new best practices emerge or as the project requirements change. 
