import os
import json
import requests
import logging
import uuid
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('counties_ingestion.log')
    ]
)
logger = logging.getLogger('counties_ingestion')

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

# Directory with GeoJSON files
DATA_DIR = Path("data/raw_geo")
DATA_DIR.mkdir(parents=True, exist_ok=True)
COUNTIES_GEOJSON = DATA_DIR / "us_counties_all.geojson"

# URL for Census Bureau counties data (2022)
COUNTIES_URL = "https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_5m.json"

def download_counties_geojson():
    """Download the counties GeoJSON file."""
    try:
        logger.info(f"Downloading counties data from {COUNTIES_URL}...")
        response = requests.get(COUNTIES_URL)
        
        if response.status_code != 200:
            logger.error(f"Failed to download counties data: HTTP {response.status_code}")
            return False
        
        # Save the GeoJSON file
        with open(COUNTIES_GEOJSON, 'w') as f:
            f.write(response.text)
        
        logger.info(f"Counties data saved to {COUNTIES_GEOJSON}")
        return True
    except Exception as e:
        logger.error(f"Error downloading counties data: {e}")
        return False

def load_geojson(file_path):
    """Load a GeoJSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load GeoJSON file {file_path}: {e}")
        return None

def ingest_counties():
    """Ingest all counties data into the database."""
    try:
        # Download counties data if needed
        if not COUNTIES_GEOJSON.exists():
            if not download_counties_geojson():
                return False
        
        # Load counties GeoJSON
        logger.info(f"Loading counties data from {COUNTIES_GEOJSON}...")
        counties_data = load_geojson(COUNTIES_GEOJSON)
        if not counties_data:
            logger.error("Failed to load counties data. Exiting.")
            return False
        
        # Create database engine
        engine = create_engine(CONNECTION_STRING)
        
        # Create a session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # First, clear existing counties
        # with session.begin():
        #     session.execute(text("DELETE FROM counties"))
        #     logger.info("Cleared existing counties data.")
        
        # Get state data from database for linking
        state_mapping = {}
        with session.begin():
            # Get states by FIPS code
            states_result = session.execute(text("SELECT id, fips_code FROM states"))
            for row in states_result:
                state_mapping[row[1]] = row[0]
        
        if not state_mapping:
            logger.error("No states found in database. Please ingest states first.")
            return False
        
        logger.info(f"Found {len(state_mapping)} states in the database.")
        
        # Process each county
        counties_inserted = 0
        counties_skipped = 0
        
        for feature in counties_data['features']:
            try:
                properties = feature['properties']
                geometry = feature['geometry']
                
                # Extract state FIPS code
                state_fips = properties.get('STATE')
                if not state_fips:
                    logger.warning("Skipping county - no state FIPS code found")
                    counties_skipped += 1
                    continue
                
                # Ensure state FIPS is a string with leading zeros if needed
                state_fips = str(state_fips).zfill(2)
                
                # Extract county FIPS code
                county_fips = properties.get('COUNTY')
                if not county_fips:
                    logger.warning("Skipping county - no county FIPS code found")
                    counties_skipped += 1
                    continue
                
                # Ensure county FIPS is a string with leading zeros if needed
                county_fips = str(county_fips).zfill(3)
                
                # Combine state and county FIPS to get full FIPS code
                fips_code = state_fips + county_fips
                
                # Find matching state ID
                state_id = state_mapping.get(state_fips)
                if not state_id:
                    logger.warning(f"Skipping county - no matching state found for FIPS {state_fips}")
                    counties_skipped += 1
                    continue
                
                # Extract county name
                county_name = properties.get('NAME')
                if not county_name:
                    logger.warning(f"Skipping county with FIPS {fips_code} - no name found")
                    counties_skipped += 1
                    continue
                
                # Extract area if available
                area_sq_miles = properties.get('CENSUSAREA')
                
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
                            'name': county_name,
                            'fips_code': fips_code,
                            'state_id': state_id,
                            'geometry': json.dumps(geometry),
                            'area_sq_miles': area_sq_miles,
                            'population': None,  # No population data in this GeoJSON
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
                counties_skipped += 1
                continue
        
        logger.info(f"Successfully inserted {counties_inserted} counties.")
        logger.info(f"Skipped {counties_skipped} counties.")
        return True
    
    except Exception as e:
        logger.error(f"Failed to ingest counties: {e}")
        return False

if __name__ == "__main__":
    ingest_counties() 