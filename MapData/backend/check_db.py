import sys
from sqlalchemy import text
from database import engine, get_db
from models.geographic import State

def check_database_connection():
    """Check if the database connection is working."""
    try:
        # Try to connect to the database
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print("❌ Database connection failed!")
        print(f"Error: {e}")
        return False

def check_postgis():
    """Check if PostGIS extension is enabled."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT PostGIS_version()"))
            version = result.scalar()
            print(f"✅ PostGIS is enabled (version: {version})")
            return True
    except Exception as e:
        print("❌ PostGIS check failed!")
        print(f"Error: {e}")
        return False

def check_tables():
    """Check if the required tables exist and have data."""
    try:
        db = next(get_db())
        
        # Check states table
        states_count = db.query(State).count()
        print(f"✅ States table exists with {states_count} records")
        
        # If we have states, check one record for area_sq_miles
        if states_count > 0:
            sample_state = db.query(State).first()
            if sample_state is not None:
                state_name = sample_state.name if hasattr(sample_state, 'name') else "Unknown"
                if hasattr(sample_state, 'area_sq_miles') and sample_state.area_sq_miles is not None:
                    print(f"✅ Sample state '{state_name}' has area_sq_miles: {sample_state.area_sq_miles}")
                else:
                    print(f"⚠️  Sample state '{state_name}' does not have area_sq_miles data")
            else:
                print("⚠️  Could not retrieve a sample state record")
        
        return True
    except Exception as e:
        print("❌ Table check failed!")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Checking database configuration...")
    
    connection_ok = check_database_connection()
    if not connection_ok:
        print("\nPlease check your database configuration in the .env file.")
        sys.exit(1)
    
    postgis_ok = check_postgis()
    if not postgis_ok:
        print("\nPostGIS extension is not enabled. Run 'python enable_postgis.py' to enable it.")
    
    tables_ok = check_tables()
    if not tables_ok:
        print("\nTables check failed. Make sure you've run the data ingestion scripts.")
    
    if connection_ok and postgis_ok and tables_ok:
        print("\n✅ All checks passed! The database is properly configured.")
        print("You can now start the FastAPI server with 'uvicorn app:app --reload'")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues before starting the server.") 