import logging
from sqlalchemy import create_engine, text
from ingest_all_states import ingest_states
from ingest_all_counties import ingest_counties
from create_spatial_indexes import create_spatial_indexes

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

def clear_all_data():
    """Clear all existing geographic data from the database."""
    try:
        # Create database engine
        engine = create_engine(CONNECTION_STRING)
        
        # Clear counties first (because of foreign key constraints)
        with engine.connect() as connection:
            with connection.begin():
                logger.info("Clearing counties table...")
                connection.execute(text("DELETE FROM counties"))
            
            with connection.begin():
                logger.info("Clearing states table...")
                connection.execute(text("DELETE FROM states"))
        
        logger.info("All geographic data cleared successfully.")
        return True
    except Exception as e:
        logger.error(f"Error clearing data: {e}")
        return False

def ingest_all_data():
    """Run the complete data ingestion process."""
    logger.info("Starting complete data ingestion process...")
    
    # Step 1: Clear all existing data
    logger.info("Step 1: Clearing existing data...")
    if not clear_all_data():
        logger.error("Failed to clear existing data. Exiting.")
        return False
    
    # Step 2: Ingest all states
    logger.info("Step 2: Ingesting states...")
    if not ingest_states():
        logger.error("Failed to ingest states. Exiting.")
        return False
    
    # Step 3: Ingest all counties
    logger.info("Step 3: Ingesting counties...")
    if not ingest_counties():
        logger.error("Failed to ingest counties. Exiting.")
        return False
    
    # Step 4: Create spatial indexes
    logger.info("Step 4: Creating spatial indexes...")
    if not create_spatial_indexes():
        logger.error("Failed to create spatial indexes. Exiting.")
        return False
    
    logger.info("Complete data ingestion process finished successfully!")
    return True

if __name__ == "__main__":
    ingest_all_data() 