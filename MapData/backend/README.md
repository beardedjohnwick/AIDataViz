# Geographic Data Ingestion for MapData Project

This directory contains scripts for ingesting geographic data into the Neon PostgreSQL database with PostGIS extension.

## Database Structure

The database contains two main tables:

1. **States Table**
   - Contains geographic boundaries and metadata for US states
   - Includes name, abbreviation, FIPS code, geometry, centroid, and area information
   - Uses PostGIS geometry types for spatial data

2. **Counties Table**
   - Contains geographic boundaries and metadata for US counties
   - Includes name, FIPS code, state reference, geometry, centroid, and area information
   - Uses PostGIS geometry types for spatial data
   - Links to states table via foreign key

## Data Sources

The geographic data was sourced from:
- US Census Bureau cartographic boundary files (2022)
- GeoJSON files from public repositories

## Ingestion Process

The data ingestion process involved:

1. **Database Setup**
   - Creating tables with appropriate schemas
   - Enabling PostGIS extension
   - Setting up spatial indexes

2. **Data Download**
   - Downloading GeoJSON files for states and counties
   - Parsing and validating the data

3. **Data Transformation**
   - Converting GeoJSON geometries to PostGIS format
   - Extracting and normalizing metadata
   - Creating relationships between states and counties

4. **Data Loading**
   - Inserting states data first
   - Inserting counties data with references to states
   - Calculating centroids and other derived data

## Current Data Status

- **States**: 52 states/territories successfully loaded (50 states + DC + Puerto Rico)
- **Counties**: 3,221 counties successfully loaded with proper state relationships

## Scripts

- `download_geo_data.py`: Downloads GeoJSON files for states and counties
- `create_counties_table.py`: Creates the counties table in the database
- `update_states_schema.py`: Updates the states table schema to include additional fields
- `ingest_geographic_data.py`: Ingests states data into the database
- `ingest_counties.py`: Ingests counties data into the database
- `ingest_all_states.py`: Downloads and ingests all 52 states/territories
- `ingest_all_counties.py`: Downloads and ingests all 3,221 counties
- `ingest_all_data.py`: Main script that runs the complete data ingestion process
- `check_db.py`: Checks the database contents and provides summary information
- `create_spatial_indexes.py`: Creates spatial indexes for better query performance

## Spatial Indexes

To optimize query performance, the following spatial indexes were created:

1. **States Table**
   - `idx_states_geometry`: Spatial index on the geometry column
   - `idx_states_centroid`: Spatial index on the centroid column
   - `idx_states_fips_code`: Index on the FIPS code column

2. **Counties Table**
   - `idx_counties_geometry`: Spatial index on the geometry column
   - `idx_counties_centroid`: Spatial index on the centroid column
   - `idx_counties_state_id`: Index on the state_id column for faster joins
   - `idx_counties_fips_code`: Index on the FIPS code column

These indexes improve performance for spatial queries, joins, and lookups by FIPS code.

## Connection Information

The database is hosted on Neon PostgreSQL and can be accessed using:

```
CONNECTION_STRING = "postgresql://aidataviz_owner:***@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"
```

*Note: Password has been redacted for security purposes.* 