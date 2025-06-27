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
        logging.FileHandler('states_ingestion.log')
    ]
)
logger = logging.getLogger('states_ingestion')

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

# Directory with GeoJSON files
DATA_DIR = Path("data/raw_geo")
DATA_DIR.mkdir(parents=True, exist_ok=True)
STATES_GEOJSON = DATA_DIR / "us_states_all.geojson"

# URL for Census Bureau states data (2022)
STATES_URL = "https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_040_00_5m.json"

def download_states_geojson():
    """Download the states GeoJSON file."""
    try:
        logger.info(f"Downloading states data from {STATES_URL}...")
        response = requests.get(STATES_URL)
        
        if response.status_code != 200:
            logger.error(f"Failed to download states data: HTTP {response.status_code}")
            return False
        
        # Save the GeoJSON file
        with open(STATES_GEOJSON, 'w') as f:
            f.write(response.text)
        
        logger.info(f"States data saved to {STATES_GEOJSON}")
        return True
    except Exception as e:
        logger.error(f"Error downloading states data: {e}")
        return False

def load_geojson(file_path):
    """Load a GeoJSON file."""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load GeoJSON file {file_path}: {e}")
        return None

# State FIPS to abbreviation mapping
STATE_FIPS_TO_ABBR = {
    "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", 
    "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL", 
    "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", 
    "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", 
    "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS", 
    "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH", 
    "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", 
    "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", 
    "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT", 
    "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI", 
    "56": "WY", "60": "AS", "66": "GU", "69": "MP", "72": "PR", 
    "78": "VI"
}

def ingest_states():
    """Ingest all states data into the database."""
    try:
        # Download states data if needed
        if not STATES_GEOJSON.exists():
            if not download_states_geojson():
                return False
        
        # Load states GeoJSON
        logger.info(f"Loading states data from {STATES_GEOJSON}...")
        states_data = load_geojson(STATES_GEOJSON)
        if not states_data:
            logger.error("Failed to load states data. Exiting.")
            return False
        
        # Create database engine
        engine = create_engine(CONNECTION_STRING)
        
        # Create a session
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # First, clear existing states
        # with session.begin():
        #     session.execute(text("DELETE FROM states"))
        #     logger.info("Cleared existing states data.")
        
        # Process each state
        states_inserted = 0
        states_skipped = 0
        
        for feature in states_data['features']:
            try:
                properties = feature['properties']
                geometry = feature['geometry']
                
                # Extract state FIPS code
                state_fips = properties.get('STATE')
                if not state_fips:
                    logger.warning(f"Skipping state - no FIPS code found")
                    states_skipped += 1
                    continue
                
                # Ensure state FIPS is a string with leading zeros if needed
                state_fips = str(state_fips).zfill(2)
                
                # Get state abbreviation
                state_abbr = STATE_FIPS_TO_ABBR.get(state_fips)
                if not state_abbr:
                    logger.warning(f"Skipping state with FIPS {state_fips} - no abbreviation found")
                    states_skipped += 1
                    continue
                
                # Extract state name
                state_name = properties.get('NAME')
                if not state_name:
                    logger.warning(f"Skipping state with FIPS {state_fips} - no name found")
                    states_skipped += 1
                    continue
                
                # Extract area if available
                area_sq_miles = properties.get('CENSUSAREA')
                
                # Insert state with PostGIS functions
                with session.begin():
                    session.execute(
                        text("""
                            INSERT INTO states 
                            (id, name, abbreviation, fips_code, geometry, centroid, area_sq_miles, population, created_at, updated_at)
                            VALUES 
                            (:id, :name, :abbreviation, :fips_code, 
                             ST_SetSRID(ST_GeomFromGeoJSON(:geometry), 4326),
                             ST_Centroid(ST_SetSRID(ST_GeomFromGeoJSON(:geometry), 4326)),
                             :area_sq_miles, :population, :created_at, :updated_at)
                        """),
                        {
                            'id': uuid.uuid4(),
                            'name': state_name,
                            'abbreviation': state_abbr,
                            'fips_code': state_fips,
                            'geometry': json.dumps(geometry),
                            'area_sq_miles': area_sq_miles,
                            'population': None,  # No population data in this GeoJSON
                            'created_at': datetime.now(),
                            'updated_at': datetime.now()
                        }
                    )
                
                states_inserted += 1
                logger.info(f"Inserted state: {state_name} ({state_abbr}), FIPS: {state_fips}")
            
            except Exception as e:
                logger.error(f"Failed to insert state: {e}")
                states_skipped += 1
                continue
        
        logger.info(f"Successfully inserted {states_inserted} states.")
        logger.info(f"Skipped {states_skipped} states.")
        return True
    
    except Exception as e:
        logger.error(f"Failed to ingest states: {e}")
        return False

if __name__ == "__main__":
    ingest_states() 