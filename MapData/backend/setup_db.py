import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

def test_connection():
    """Test the database connection."""
    try:
        # Create SQLAlchemy engine
        engine = create_engine(CONNECTION_STRING)
        
        # Try to connect and execute a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Connection successful!")
            
            # Check if PostGIS extension is available
            try:
                postgis_result = connection.execute(text("SELECT PostGIS_Version()"))
                version = postgis_result.scalar()
                print(f"✅ PostGIS is installed (version: {version})")
            except Exception as e:
                print(f"⚠️ PostGIS might not be installed: {e}")
                print("You may need to run: CREATE EXTENSION postgis;")
        
        # Print connection details for .env file
        print("\n--- Connection Details for .env file ---")
        print("DB_HOST=ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech")
        print("DB_PORT=5432")
        print("DB_NAME=aidataviz")
        print("DB_USER=aidataviz_owner")
        print("DB_PASSWORD=npg_jQRrEC5dpq3o")
        print("DATABASE_URL=" + CONNECTION_STRING)
        
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing connection to Neon database...")
    success = test_connection()
    
    if success:
        print("\nNext steps:")
        print("1. Create a .env file in the MapData/backend/ directory with the connection details shown above")
        print("2. Install dependencies: pip install -r requirements.txt")
        print("3. Run your FastAPI application: uvicorn app:app --reload")
    else:
        print("\nPlease check your connection string and network settings.") 