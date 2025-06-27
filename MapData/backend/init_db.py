from sqlalchemy import text
from database import engine, Base
from models.geographic import State

def init_db():
    """Initialize the database by creating all tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    
    # Verify the tables were created
    with engine.connect() as connection:
        tables = connection.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        print("\nTables in database:")
        for table in tables:
            print(f"- {table[0]}")

if __name__ == "__main__":
    init_db() 