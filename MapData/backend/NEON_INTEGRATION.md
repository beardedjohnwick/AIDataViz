# Neon Database Integration Guide

This guide explains how to integrate your Neon PostgreSQL database with the MapData application to enable data visualization features like displaying area_sq_miles on state hover.

## Prerequisites

1. A Neon account and project (sign up at https://neon.tech if you don't have one)
2. Python 3.8+ installed
3. Node.js and npm installed (for the frontend)

## Backend Setup

### 1. Configure Database Connection

1. Copy the example environment file to create your own:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your Neon database credentials:
   ```
   DB_HOST=your-neon-hostname.neon.tech
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-username
   DB_PASSWORD=your-password
   ```

   Alternatively, you can use the full connection string:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   ```

### 2. Set Up the Environment

Run the setup script to create a virtual environment and install dependencies:
```bash
./setup_env.sh
```

Activate the virtual environment:
```bash
source venv/bin/activate
```

### 3. Check Database Connection

Run the database check script to verify your connection:
```bash
python check_db.py
```

If the connection is successful but PostGIS is not enabled, run:
```bash
python enable_postgis.py
```

### 4. Initialize the Database

If you haven't already populated your database with geographic data, run:
```bash
python ingest_all_data.py
```

This will:
1. Create the necessary tables
2. Download geographic data if needed
3. Ingest states and counties data with area_sq_miles information

### 5. Start the Backend Server

Start the FastAPI server:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

The frontend has been updated to fetch data from the API. To start it:

```bash
cd ../frontend
npm install
npm start
```

## Testing the Integration

1. Make sure both backend and frontend servers are running
2. Open the application in your browser (usually at http://localhost:3000)
3. Hover over states to see the area_sq_miles information in the tooltip
4. If the API connection fails, the application will automatically fall back to static data

## Troubleshooting

### API Connection Issues
- Check that the backend server is running on port 8000
- Verify CORS settings in app.py if you encounter cross-origin issues
- Check browser console for network errors

### Database Connection Issues
- Verify your Neon database credentials in the .env file
- Make sure your IP address is allowed in Neon's connection settings
- Check if the database has the PostGIS extension enabled

### Data Issues
- If area_sq_miles is not showing up, check if the data was properly ingested
- Run `python check_db.py` to verify data integrity
- Check the API response using a tool like curl or Postman 