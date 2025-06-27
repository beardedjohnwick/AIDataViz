import os
import json
import logging
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('data_ingestion.log')
    ]
)
logger = logging.getLogger('data_ingestion')

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

# Directory with GeoJSON files
DATA_DIR = Path("data/raw_geo")
STATES_GEOJSON = DATA_DIR / "states.geojson"
COUNTIES_GEOJSON = DATA_DIR / "counties.geojson"

def create_db_engine():
    """Create a database engine."""
    try:
        engine = create_engine(CONNECTION_STRING)
        return engine
    except Exception as e:
        logger.error(f"Failed to create database engine: {e}")
        return None

def load_geojson(file_path):
    """Load a GeoJSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load GeoJSON file {file_path}: {e}")
        return None

def ingest_states(engine, geojson_data):
    """Ingest state data into the database."""
    if not geojson_data:
        logger.error("No state data to ingest.")
        return False
    
    try:
        # Create a session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # First, clear existing states
        with session.begin():
            session.execute(text("DELETE FROM states"))
            logger.info("Cleared existing states data.")
        
        # Process each state
        states_inserted = 0
        for feature in geojson_data['features']:
            try:
                properties = feature['properties']
                geometry = feature['geometry']
                
                # Extract state data
                name = properties.get('name', '')
                
                # Handle different property naming conventions in GeoJSON sources
                if 'postal' in properties:
                    abbreviation = properties['postal']
                elif 'abbr' in properties:
                    abbreviation = properties['abbr']
                elif 'code' in properties:
                    abbreviation = properties['code']
                elif 'STATE_ABBR' in properties:
                    abbreviation = properties['STATE_ABBR']
                else:
                    # Generate abbreviation from first letters if not available
                    abbreviation = ''.join([word[0] for word in name.split()[:2]]).upper()
                
                # Extract FIPS code if available
                if 'fips' in properties:
                    fips_code = properties['fips']
                elif 'STATEFP' in properties:
                    fips_code = properties['STATEFP']
                elif 'STATE_FIPS' in properties:
                    fips_code = properties['STATE_FIPS']
                else:
                    # Generate a placeholder FIPS code
                    fips_code = f"{states_inserted + 1:02d}"
                
                # Extract population if available
                population = properties.get('population', properties.get('POPULATION', None))
                
                # Extract area if available
                area_sq_miles = properties.get('area_sq_mi', properties.get('AREA', None))
                
                # Calculate centroid
                with session.begin():
                    # Insert state with PostGIS functions
                    session.execute(
                        text("""
                            INSERT INTO states 
                            (id, name, abbreviation, fips_code, geometry, centroid, population, area_sq_miles, properties, created_at, updated_at)
                            VALUES 
                            (:id, :name, :abbreviation, :fips_code, 
                             ST_SetSRID(ST_GeomFromGeoJSON(:geometry), 4326),
                             ST_Centroid(ST_SetSRID(ST_GeomFromGeoJSON(:geometry), 4326)),
                             :population, :area_sq_miles, :properties, :created_at, :updated_at)
                        """),
                        {
                            'id': uuid.uuid4(),
                            'name': name,
                            'abbreviation': abbreviation,
                            'fips_code': fips_code,
                            'geometry': json.dumps(geometry),
                            'population': population,
                            'area_sq_miles': area_sq_miles,
                            'properties': json.dumps(properties),
                            'created_at': datetime.now(),
                            'updated_at': datetime.now()
                        }
                    )
                
                states_inserted += 1
                logger.info(f"Inserted state: {name} ({abbreviation})")
            
            except Exception as e:
                logger.error(f"Failed to insert state: {e}")
                continue
        
        logger.info(f"Successfully inserted {states_inserted} states.")
        return True
    
    except Exception as e:
        logger.error(f"Failed to ingest states: {e}")
        return False

def ingest_counties(engine, geojson_data):
    """Ingest county data into the database."""
    if not geojson_data:
        logger.error("No county data to ingest.")
        return False
    
    try:
        # Create a session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # First, clear existing counties
        with session.begin():
            session.execute(text("DELETE FROM counties"))
            logger.info("Cleared existing counties data.")
        
        # Get state IDs by FIPS code for linking
        state_ids = {}
        with session.begin():
            result = session.execute(text("SELECT id, fips_code FROM states"))
            for row in result:
                state_ids[row[1]] = row[0]
        
        if not state_ids:
            logger.error("No states found in database. Please ingest states first.")
            return False
        
        # Process each county
        counties_inserted = 0
        for feature in geojson_data['features']:
            try:
                properties = feature['properties']
                geometry = feature['geometry']
                
                # Extract county data
                if 'NAME' in properties:
                    name = properties['NAME']
                elif 'name' in properties:
                    name = properties['name']
                else:
                    name = f"County {counties_inserted + 1}"
                
                # Extract FIPS code
                if 'FIPS' in properties:
                    fips_code = properties['FIPS']
                elif 'fips' in properties:
                    fips_code = properties['fips']
                elif 'GEOID' in properties:
                    fips_code = properties['GEOID']
                else:
                    # Skip if no FIPS code
                    logger.warning(f"Skipping county {name} - no FIPS code found")
                    continue
                
                # Get state ID from the first 2 digits of FIPS code
                state_fips = fips_code[:2]
                if state_fips not in state_ids:
                    logger.warning(f"Skipping county {name} - state with FIPS {state_fips} not found")
                    continue
                
                state_id = state_ids[state_fips]
                
                # Extract population if available
                population = properties.get('population', properties.get('POPULATION', None))
                
                # Extract area if available
                area_sq_miles = properties.get('area_sq_mi', properties.get('AREA', None))
                
                # Insert county with PostGIS functions
                with session.begin():
                    session.execute(
                        text("""
                            INSERT INTO counties 
                            (id, name, fips_code, state_id, geometry, centroid, area_sq_miles, population, properties, created_at, updated_at)
                            VALUES 
                            (:id, :name, :fips_code, :state_id, 
                             ST_SetSRID(ST_GeomFromGeoJSON(:geometry), 4326),
                             ST_Centroid(ST_SetSRID(ST_GeomFromGeoJSON(:geometry), 4326)),
                             :area_sq_miles, :population, :properties, :created_at, :updated_at)
                        """),
                        {
                            'id': uuid.uuid4(),
                            'name': name,
                            'fips_code': fips_code,
                            'state_id': state_id,
                            'geometry': json.dumps(geometry),
                            'area_sq_miles': area_sq_miles,
                            'population': population,
                            'properties': json.dumps(properties),
                            'created_at': datetime.now(),
                            'updated_at': datetime.now()
                        }
                    )
                
                counties_inserted += 1
                if counties_inserted % 100 == 0:
                    logger.info(f"Inserted {counties_inserted} counties so far...")
            
            except Exception as e:
                logger.error(f"Failed to insert county: {e}")
                continue
        
        logger.info(f"Successfully inserted {counties_inserted} counties.")
        return True
    
    except Exception as e:
        logger.error(f"Failed to ingest counties: {e}")
        return False

def main():
    """Main function to ingest geographic data."""
    logger.info("Starting geographic data ingestion...")
    
    # Create database engine
    engine = create_db_engine()
    if not engine:
        logger.error("Failed to create database engine. Exiting.")
        return
    
    # Load state GeoJSON
    logger.info(f"Loading state data from {STATES_GEOJSON}...")
    states_data = load_geojson(STATES_GEOJSON)
    if not states_data:
        logger.error("Failed to load state data. Exiting.")
        return
    
    # Ingest states
    logger.info("Ingesting state data...")
    if ingest_states(engine, states_data):
        logger.info("State data ingestion completed successfully.")
    else:
        logger.error("State data ingestion failed.")
        return
    
    # Load county GeoJSON
    logger.info(f"Loading county data from {COUNTIES_GEOJSON}...")
    counties_data = load_geojson(COUNTIES_GEOJSON)
    if not counties_data:
        logger.error("Failed to load county data. Exiting.")
        return
    
    # Ingest counties
    logger.info("Ingesting county data...")
    if ingest_counties(engine, counties_data):
        logger.info("County data ingestion completed successfully.")
    else:
        logger.error("County data ingestion failed.")
    
    logger.info("Geographic data ingestion process completed.")

if __name__ == "__main__":
    main() 