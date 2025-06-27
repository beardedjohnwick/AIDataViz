from sqlalchemy import create_engine, text
import json

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

def check_database():
    """Check the database contents."""
    try:
        # Create SQLAlchemy engine
        engine = create_engine(CONNECTION_STRING)
        
        # Try to connect and execute queries
        with engine.connect() as connection:
            # Check states count
            states_result = connection.execute(text("SELECT COUNT(*) FROM states")).fetchone()
            states_count = states_result[0] if states_result else 0
            print(f"Number of states in database: {states_count}")
            
            if states_count > 0:
                # Get sample states
                states = connection.execute(text("""
                    SELECT name, abbreviation, fips_code 
                    FROM states 
                    ORDER BY name 
                    LIMIT 5
                """)).fetchall()
                
                print("\nSample states:")
                for state in states:
                    print(f"- {state[0]} ({state[1]}), FIPS: {state[2]}")
                
                # Get states with most counties
                states_with_counties = connection.execute(text("""
                    SELECT s.name, COUNT(c.id) as county_count
                    FROM states s
                    LEFT JOIN counties c ON s.id = c.state_id
                    GROUP BY s.name
                    ORDER BY county_count DESC
                    LIMIT 5
                """)).fetchall()
                
                print("\nStates with most counties:")
                for state in states_with_counties:
                    print(f"- {state[0]}: {state[1]} counties")
            
            # Check counties count
            counties_result = connection.execute(text("SELECT COUNT(*) FROM counties")).fetchone()
            counties_count = counties_result[0] if counties_result else 0
            print(f"\nNumber of counties in database: {counties_count}")
            
            if counties_count > 0:
                # Get sample counties
                counties = connection.execute(text("""
                    SELECT c.name, s.name as state_name, c.fips_code
                    FROM counties c
                    JOIN states s ON c.state_id = s.id
                    ORDER BY s.name, c.name
                    LIMIT 10
                """)).fetchall()
                
                print("\nSample counties:")
                for county in counties:
                    print(f"- {county[0]}, {county[1]}, FIPS: {county[2]}")
                
                # Get counties with largest area
                large_counties = connection.execute(text("""
                    SELECT c.name, s.name as state_name, c.area_sq_miles
                    FROM counties c
                    JOIN states s ON c.state_id = s.id
                    ORDER BY c.area_sq_miles DESC NULLS LAST
                    LIMIT 5
                """)).fetchall()
                
                print("\nLargest counties by area:")
                for county in large_counties:
                    area = county[2] if county[2] else "Unknown"
                    print(f"- {county[0]}, {county[1]}: {area} sq miles")
        
        return True
    except Exception as e:
        print(f"Error checking database: {e}")
        return False

if __name__ == "__main__":
    check_database() 