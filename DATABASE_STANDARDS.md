# Database Standards for MapData Project

## Overview
This document outlines the standards and best practices for database design, optimization, and usage in the MapData project, focusing on PostgreSQL with PostGIS extension.

## Database Schema Design

### Naming Conventions
- **Tables**: Use snake_case, plural nouns (e.g., `states`, `counties`, `demographic_data`)
- **Columns**: Use snake_case (e.g., `population_count`, `median_income`)
- **Primary Keys**: Use `id` as the primary key name
- **Foreign Keys**: Use `<table_name>_id` format (e.g., `state_id`)
- **Indexes**: Use `idx_<table_name>_<column_name>` format (e.g., `idx_states_name`)
- **Constraints**: Use `ck_<table_name>_<constraint_description>` format (e.g., `ck_states_name_not_empty`)
- **Geometry Columns**: Use `geometry` or `geom` with a suffix indicating the type if needed (e.g., `geometry_point`, `geom_polygon`)

### Table Structure
- Always include the following columns in each table:
  - `id`: Primary key, use UUID or BIGSERIAL
  - `created_at`: Timestamp with time zone, default to current time
  - `updated_at`: Timestamp with time zone, default to current time, updated on change
- For audit purposes, consider adding:
  - `created_by`: Reference to users table or string
  - `updated_by`: Reference to users table or string

### Relationships
- Use foreign keys to enforce referential integrity
- Consider using ON DELETE CASCADE/RESTRICT/SET NULL appropriately
- Document relationship cardinality in comments or documentation

## PostGIS Specific Standards

### Geometry Data
- Store all geometries in the WGS84 spatial reference system (SRID 4326) unless there's a specific reason not to
- Use the appropriate geometry type (POINT, LINESTRING, POLYGON, etc.)
- For complex geometries, consider using MULTIPOLYGON to handle cases like states with islands
- Document the source and accuracy of geometric data

### Spatial Indexing
- Always create a GiST index on geometry columns:
  ```sql
  CREATE INDEX idx_table_geom ON table USING GIST (geometry);
  ```
- For frequently queried attributes alongside geometry, consider creating composite indexes

### Performance Optimization
- For large or complex geometries, consider:
  - Using ST_Simplify for display purposes
  - Creating multiple versions of geometries at different simplification levels
  - Pre-calculating common spatial relationships

## Query Optimization

### General Guidelines
- Avoid SELECT * - specify only needed columns
- Use EXPLAIN ANALYZE to understand query execution plans
- Use appropriate JOIN types (INNER, LEFT, etc.)
- Filter data as early as possible in the query
- Use WHERE clauses before expensive operations

### Spatial Query Optimization
- Use spatial index operators (&&, ST_Intersects, etc.) to leverage spatial indexes
- For large datasets, use ST_DWithin instead of ST_Distance for proximity queries
- Consider using ST_Relate for complex spatial relationships
- For large area calculations, consider using geography type instead of geometry

### Common Patterns
- For point-in-polygon queries:
  ```sql
  SELECT states.name 
  FROM states 
  WHERE ST_Contains(states.geometry, ST_SetSRID(ST_Point(-73.935242, 40.730610), 4326));
  ```

- For finding objects within a distance:
  ```sql
  SELECT poi.name 
  FROM points_of_interest poi 
  WHERE ST_DWithin(
    poi.geometry,
    ST_SetSRID(ST_Point(-73.935242, 40.730610), 4326),
    0.01  -- approximately 1km at the equator
  );
  ```

## Database Migrations

### Migration Standards
- Use a migration tool (Alembic with SQLAlchemy)
- Each migration should be atomic and reversible when possible
- Migrations should be idempotent when possible
- Include descriptive comments in migration files
- Test migrations on a copy of production data before applying to production

### Migration Naming
- Use a timestamp or sequential number prefix
- Include a brief description of the migration
- Example: `20230601120000_add_population_column_to_states.py`

## Data Loading and ETL

### Data Import Standards
- Validate data before importing
- Use transactions for data imports
- Log import statistics (records processed, errors, etc.)
- Consider using COPY command for bulk imports instead of INSERT
- For large imports, consider temporarily disabling triggers and indexes

### ETL Process
- Document data sources and transformation logic
- Include data lineage information
- Implement error handling and reporting
- Consider incremental updates for large datasets

## Security

### Access Control
- Use role-based access control
- Follow principle of least privilege
- Create specific database roles for different access patterns
- Avoid using the postgres superuser account for application access

### Data Protection
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data at rest
- Consider using row-level security for multi-tenant data
- Implement appropriate backup and disaster recovery procedures

## Monitoring and Maintenance

### Performance Monitoring
- Regularly monitor query performance
- Set up alerts for long-running queries
- Monitor index usage and bloat
- Track table and database size growth

### Maintenance Tasks
- Schedule regular VACUUM and ANALYZE operations
- Monitor and manage table bloat
- Plan for database scaling (vertical and horizontal)
- Implement appropriate backup strategies

## Development Practices

### Local Development
- Use Docker containers for consistent PostgreSQL/PostGIS environments
- Seed development databases with representative test data
- Document setup procedures for new developers

### Testing
- Create specific test databases
- Implement database integration tests
- Use transaction rollbacks to reset database state between tests
- Consider using pgTAP for database unit testing

## Appendix: Useful PostgreSQL/PostGIS Commands

### Index Creation
```sql
-- B-tree index for regular columns
CREATE INDEX idx_table_column ON table (column);

-- GiST index for geometry columns
CREATE INDEX idx_table_geom ON table USING GIST (geometry);

-- Partial index for filtered queries
CREATE INDEX idx_table_column_partial ON table (column) WHERE condition;
```

### Performance Analysis
```sql
-- Explain a query plan
EXPLAIN ANALYZE SELECT * FROM table WHERE condition;

-- Find unused indexes
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Maintenance
```sql
-- Analyze a table
ANALYZE table;

-- Vacuum a table
VACUUM (ANALYZE, VERBOSE) table;

-- Reindex a table
REINDEX TABLE table;
``` 