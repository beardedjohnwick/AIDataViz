from sqlalchemy import create_engine, text
import os

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

def update_states_schema():
    """Update the states table schema to include the centroid column."""
    try:
        # Create SQLAlchemy engine
        engine = create_engine(CONNECTION_STRING)
        
        # Try to connect and execute a simple query
        with engine.connect() as connection:
            # Add centroid column
            print("Adding centroid column to states table...")
            with connection.begin():
                connection.execute(text("""
                    ALTER TABLE states 
                    ADD COLUMN IF NOT EXISTS centroid GEOMETRY(POINT, 4326);
                """))
                
                # Rename area_sq_mi to area_sq_miles for consistency
                connection.execute(text("""
                    ALTER TABLE states 
                    RENAME COLUMN area_sq_mi TO area_sq_miles;
                """))
                
                print("✅ States table schema updated successfully!")
            
            # Verify the columns
            columns = connection.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'states'
            """))
            print("\nStates table columns:")
            for column in columns:
                print(f"- {column[0]}: {column[1]}")
        
        return True
    except Exception as e:
        print(f"Error updating states schema: {e}")
        return False

if __name__ == "__main__":
    update_states_schema() 