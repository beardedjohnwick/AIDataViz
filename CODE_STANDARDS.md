# MapData Project Coding Standards

## Overview
This document outlines the coding standards and best practices for the MapData project. These guidelines are designed to ensure code quality, performance, maintainability, and scalability across the application.

## Core Principles

### 1. Performance Optimization

#### Frontend (React/Leaflet)
- **Component Rendering**
  - Use `React.memo` for components that render often but with the same props
  - Implement `useCallback` for function props and `useMemo` for computed values
  - Avoid unnecessary re-renders by keeping component state as local as possible
  
- **Data Loading**
  - Implement lazy loading for routes using `React.lazy` and `Suspense`
  - Use pagination or virtualization for large datasets
  - Implement client-side caching for frequently accessed GeoJSON data
  
- **Map Performance**
  - Limit the number of visible map layers at once
  - Use clustering for dense point data
  - Implement level-of-detail rendering based on zoom level
  - Consider using WebGL rendering for large datasets
  
- **Bundle Optimization**
  - Use code splitting for large components and libraries
  - Import only needed components from libraries (e.g., `import { Button } from 'library'` not `import library`)
  - Regularly audit bundle size with tools like `webpack-bundle-analyzer`

#### Backend (FastAPI/PostGIS)
- **Database Optimization**
  - Ensure all geometry columns have appropriate GIST indexes
  - Use spatial functions efficiently (ST_Simplify for complex geometries)
  - Write optimized queries that limit returned data to what's needed
  - Use database connection pooling
  
- **API Performance**
  - Implement appropriate caching strategies (Redis for frequently accessed data)
  - Use asynchronous handlers for I/O-bound operations
  - Compress API responses (gzip/Brotli)
  - Consider implementing ETags for cacheable responses

### 2. Modularity and Independence

#### Component Architecture
- **Single Responsibility Principle**
  - Each component, function, or module should do one thing well
  - Separate concerns: data fetching, rendering, state management, etc.
  
- **Component Hierarchy**
  - Create small, reusable components
  - Organize components by feature or domain
  - Use composition over inheritance
  
- **State Management**
  - Keep state as local as possible
  - Use context or state management libraries only when state needs to be shared

#### API Architecture
- **Endpoint Organization**
  - Group endpoints by domain/feature
  - Use consistent naming patterns
  - Implement versioning for API endpoints
  
- **Service Layer**
  - Separate business logic from route handlers
  - Create reusable services for common operations

### 3. Code File Structure

- **File Size Limits**
  - Frontend component files: ≤ 300 lines
  - Backend route files: ≤ 200 lines
  - Service/utility files: ≤ 500 lines
  - Test files: No strict limit, but organize by test suites
  
- **Function/Method Size**
  - Functions should be ≤ 50 lines
  - Complex functions should be broken down into smaller, well-named helper functions
  
- **Directory Structure**
  - Group files by feature rather than by type when appropriate
  - Keep related files close to each other

### 4. Refactoring Guidelines

- **When to Refactor**
  - When adding a new feature that touches existing code
  - When fixing bugs in complex areas
  - When code becomes difficult to understand or modify
  
- **Refactoring Techniques**
  - Extract method/component for code reuse
  - Rename for clarity
  - Move method/function to more appropriate location
  - Replace conditional with polymorphism when appropriate
  
- **Code Smells to Watch For**
  - Duplicated code
  - Long methods/functions
  - Large classes/components
  - Feature envy (a function using more features of another class than its own)
  - Primitive obsession (using primitives instead of small objects)
  - Long parameter lists

### 5. Professional Quality Standards

#### Code Style
- **Naming Conventions**
  - Frontend: camelCase for variables/functions, PascalCase for components
  - Backend: snake_case for variables/functions, PascalCase for classes
  - All names should be descriptive and reveal intent
  
- **Comments and Documentation**
  - Write self-documenting code with clear variable/function names
  - Add comments for complex algorithms or non-obvious decisions
  - Document public APIs with clear parameters and return values
  - Maintain up-to-date README files for each major component

#### Error Handling
- **Frontend**
  - Implement error boundaries for React components
  - Provide user-friendly error messages
  - Log detailed errors for debugging
  
- **Backend**
  - Use appropriate HTTP status codes
  - Return consistent error response formats
  - Log errors with context for debugging
  - Handle exceptions at appropriate levels

#### Testing
- **Test Coverage Goals**
  - Backend: 80%+ coverage for business logic
  - Frontend: 70%+ coverage for components
  
- **Testing Types**
  - Unit tests for individual functions/components
  - Integration tests for API endpoints and component interactions
  - End-to-end tests for critical user flows

#### Security
- **Frontend**
  - Sanitize user inputs
  - Protect against XSS attacks
  - Use HTTPS for all requests
  
- **Backend**
  - Validate and sanitize all inputs
  - Implement proper authentication and authorization
  - Use parameterized queries to prevent SQL injection
  - Follow the principle of least privilege

#### Version Control
- **Commit Guidelines**
  - Write clear, concise commit messages
  - Make small, atomic commits
  - Reference issue numbers in commits when applicable
  
- **Branching Strategy**
  - main/master: production-ready code
  - develop: integration branch
  - feature/*: for new features
  - bugfix/*: for bug fixes
  - release/*: for release preparation

## Tool-Specific Guidelines
See the following files for specific tool configurations:
- `.eslintrc.js` - JavaScript/React linting rules
- `.prettierrc` - Code formatting rules for JavaScript/React
- `pyproject.toml` - Python linting, formatting, and testing configuration 