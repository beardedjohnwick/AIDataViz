import os
from sqlalchemy import create_engine, text

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

def enable_postgis():
    """Enable PostGIS extension on the database."""
    try:
        # Create SQLAlchemy engine
        engine = create_engine(CONNECTION_STRING)
        
        # Try to enable PostGIS
        with engine.connect() as connection:
            # Start a transaction
            with connection.begin():
                print("Enabling PostGIS extension...")
                connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
                print("✅ PostGIS extension enabled successfully!")
                
                # Verify PostGIS is installed
                postgis_result = connection.execute(text("SELECT PostGIS_Version()"))
                version = postgis_result.scalar()
                print(f"✅ PostGIS version: {version}")
                
        return True
    except Exception as e:
        print(f"❌ Error enabling PostGIS: {e}")
        return False

if __name__ == "__main__":
    success = enable_postgis()
    
    if success:
        print("\nPostGIS is now enabled. You can use spatial functions in your database.")
    else:
        print("\nFailed to enable PostGIS. You may need to contact Neon support to enable the extension.") 