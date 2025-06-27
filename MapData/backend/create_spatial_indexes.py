from sqlalchemy import create_engine, text
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('spatial_indexes')

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

def create_spatial_indexes():
    """Create spatial indexes for better query performance."""
    try:
        # Create SQLAlchemy engine
        engine = create_engine(CONNECTION_STRING)
        
        # Create indexes
        with engine.connect() as connection:
            # Start transaction
            with connection.begin():
                # Create spatial index on states geometry
                logger.info("Creating spatial index on states.geometry...")
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_states_geometry 
                    ON states USING GIST(geometry);
                """))
                
                # Create spatial index on states centroid
                logger.info("Creating spatial index on states.centroid...")
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_states_centroid 
                    ON states USING GIST(centroid);
                """))
                
                # Create spatial index on counties geometry
                logger.info("Creating spatial index on counties.geometry...")
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_counties_geometry 
                    ON counties USING GIST(geometry);
                """))
                
                # Create spatial index on counties centroid
                logger.info("Creating spatial index on counties.centroid...")
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_counties_centroid 
                    ON counties USING GIST(centroid);
                """))
                
                # Create index on counties state_id for faster joins
                logger.info("Creating index on counties.state_id...")
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_counties_state_id 
                    ON counties(state_id);
                """))
                
                # Create index on counties fips_code
                logger.info("Creating index on counties.fips_code...")
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_counties_fips_code 
                    ON counties(fips_code);
                """))
                
                # Create index on states fips_code
                logger.info("Creating index on states.fips_code...")
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_states_fips_code 
                    ON states(fips_code);
                """))
                
                logger.info("All spatial indexes created successfully!")
                
        return True
    except Exception as e:
        logger.error(f"Error creating spatial indexes: {e}")
        return False

if __name__ == "__main__":
    create_spatial_indexes() 