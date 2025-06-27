#!/bin/bash

# Setup environment script for MapData backend

echo "Setting up environment for MapData backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is not installed. Please install pip3 and try again."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from env.example..."
    cp env.example .env
    echo "Please edit the .env file with your database credentials."
fi

echo ""
echo "Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit the .env file with your Neon database credentials"
echo "2. Run 'source venv/bin/activate' to activate the virtual environment"
echo "3. Run 'uvicorn app:app --reload' to start the FastAPI server"
echo ""
echo "To check database connection, run 'python check_db.py'"
echo "" 