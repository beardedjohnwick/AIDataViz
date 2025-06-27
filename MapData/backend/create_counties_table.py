from sqlalchemy import create_engine, text
import os

# The connection string from Neon
CONNECTION_STRING = "postgresql://aidataviz_owner:npg_jQRrEC5dpq3o@ep-green-darkness-a8385q84-pooler.eastus2.azure.neon.tech/aidataviz?sslmode=require&channel_binding=require"

def create_counties_table():
    """Create the counties table in the database."""
    try:
        # Create SQLAlchemy engine
        engine = create_engine(CONNECTION_STRING)
        
        # Try to connect and execute a simple query
        with engine.connect() as connection:
            # Enable uuid-ossp extension
            print("Enabling uuid-ossp extension...")
            with connection.begin():
                connection.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"))
            
            # Create counties table
            print("Creating counties table...")
            with connection.begin():
                connection.execute(text("""
                    CREATE TABLE IF NOT EXISTS counties (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        name VARCHAR(100) NOT NULL,
                        fips_code VARCHAR(5) NOT NULL UNIQUE,
                        state_id UUID REFERENCES states(id) NOT NULL,
                        geometry GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
                        centroid GEOMETRY(POINT, 4326),
                        area_sq_miles FLOAT,
                        population INTEGER,
                        properties JSONB,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                """))
                
                # Create spatial index on geometry column
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_counties_geometry ON counties USING GIST (geometry);
                """))
                
                # Create index on fips_code
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_counties_fips_code ON counties (fips_code);
                """))
                
                # Create index on state_id
                connection.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_counties_state_id ON counties (state_id);
                """))
                
                # Create trigger for updated_at
                connection.execute(text("""
                    CREATE OR REPLACE FUNCTION update_modified_column()
                    RETURNS TRIGGER AS $$
                    BEGIN
                        NEW.updated_at = NOW();
                        RETURN NEW;
                    END;
                    $$ language 'plpgsql';
                """))
                
                connection.execute(text("""
                    DROP TRIGGER IF EXISTS update_counties_modtime ON counties;
                """))
                
                connection.execute(text("""
                    CREATE TRIGGER update_counties_modtime
                    BEFORE UPDATE ON counties
                    FOR EACH ROW
                    EXECUTE FUNCTION update_modified_column();
                """))
                
            print("✅ Counties table created successfully!")
            
            # Verify the table was created
            tables_result = connection.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'counties'
            """))
            if tables_result.rowcount > 0:
                print("Counties table exists in the database.")
                
                # Check counties table structure
                counties_columns = connection.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'counties'
                """))
                print("\nCounties table columns:")
                for column in counties_columns:
                    print(f"- {column[0]}: {column[1]}")
            else:
                print("❌ Failed to create counties table.")
        
        return True
    except Exception as e:
        print(f"Error creating counties table: {e}")
        return False

if __name__ == "__main__":
    create_counties_table() 