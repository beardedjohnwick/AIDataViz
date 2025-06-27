from sqlalchemy import create_engine, text
import os

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

def check_schema():
    """Check the current database schema."""
    try:
        # Create SQLAlchemy engine
        engine = create_engine(CONNECTION_STRING)
        
        # Try to connect and execute a simple query
        with engine.connect() as connection:
            # Check tables
            tables_result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            tables = [table[0] for table in tables_result]
            print("Existing tables:", tables)
            
            # Check states table structure
            if 'states' in tables:
                states_columns = connection.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'states'
                """))
                print("\nStates table columns:")
                for column in states_columns:
                    print(f"- {column[0]}: {column[1]}")
            
            # Check if counties table exists
            if 'counties' in tables:
                counties_columns = connection.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'counties'
                """))
                print("\nCounties table columns:")
                for column in counties_columns:
                    print(f"- {column[0]}: {column[1]}")
            else:
                print("\nCounties table does not exist yet.")
        
        return True
    except Exception as e:
        print(f"Error checking schema: {e}")
        return False

if __name__ == "__main__":
    check_schema() 