import os
import requests
import zipfile
import io
import json
from pathlib import Path
import ssl
import urllib3

# URLs for Census Bureau cartographic boundary files (2022)
STATES_URL = "https://www2.census.gov/geo/tiger/GENZ2022/shp/cb_2022_us_state_500k.zip"
COUNTIES_URL = "https://www2.census.gov/geo/tiger/GENZ2022/shp/cb_2022_us_county_500k.zip"

# Alternative data sources (GeoJSON directly)
STATES_GEOJSON_URL = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
COUNTIES_GEOJSON_URL = "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json"

# Directory to save the data
DATA_DIR = Path("data/raw_geo")

def download_and_extract_shapefile(url, target_dir):
    """
    Download a zipped shapefile and extract it to the target directory.
    """
    print(f"Downloading data from {url}...")
    try:
        response = requests.get(url, verify=False)  # Disable SSL verification
        
        if response.status_code != 200:
            print(f"Failed to download data: HTTP {response.status_code}")
            return False
        
        # Create a zipfile object from the response content
        with zipfile.ZipFile(io.BytesIO(response.content)) as zip_ref:
            # Extract all files to the target directory
            zip_ref.extractall(target_dir)
            
            # Print the extracted files
            files = zip_ref.namelist()
            print(f"Extracted {len(files)} files:")
            for file in files:
                print(f"- {file}")
        
        return True
    except Exception as e:
        print(f"Error downloading shapefile: {e}")
        return False

def download_geojson(url, output_file):
    """
    Download a GeoJSON file directly.
    """
    print(f"Downloading GeoJSON from {url}...")
    try:
        response = requests.get(url, verify=False)  # Disable SSL verification
        
        if response.status_code != 200:
            print(f"Failed to download data: HTTP {response.status_code}")
            return False
        
        # Save the GeoJSON file
        with open(output_file, 'wb') as f:
            f.write(response.content)
        
        print(f"GeoJSON file saved to {output_file}")
        return True
    except Exception as e:
        print(f"Error downloading GeoJSON: {e}")
        return False

def convert_shapefile_to_geojson(shapefile_dir, output_file):
    """
    Convert a shapefile to GeoJSON format using the geopandas library.
    """
    try:
        import geopandas as gpd
        
        # Find the .shp file in the directory
        shp_files = list(Path(shapefile_dir).glob("*.shp"))
        if not shp_files:
            print(f"No shapefile found in {shapefile_dir}")
            return False
        
        shapefile_path = shp_files[0]
        print(f"Converting {shapefile_path} to GeoJSON...")
        
        # Read the shapefile
        gdf = gpd.read_file(shapefile_path)
        
        # Convert to GeoJSON
        geojson_path = Path(output_file)
        gdf.to_file(geojson_path, driver="GeoJSON")
        print(f"GeoJSON file created at {geojson_path}")
        
        return True
    except ImportError:
        print("geopandas library not installed. Installing...")
        try:
            import pip
            pip.main(["install", "geopandas"])
            print("geopandas installed. Retrying conversion...")
            return convert_shapefile_to_geojson(shapefile_dir, output_file)
        except Exception as e:
            print(f"Failed to install geopandas: {e}")
            print("Please install geopandas manually: pip install geopandas")
            return False
    except Exception as e:
        print(f"Error converting shapefile to GeoJSON: {e}")
        return False

def download_geo_data():
    """
    Download geographic data for US states and counties.
    """
    # Create the data directory if it doesn't exist
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Disable SSL warnings
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # Try to download GeoJSON directly first (easier)
    states_geojson_path = DATA_DIR / "states.geojson"
    counties_geojson_path = DATA_DIR / "counties.geojson"
    
    # Download state boundaries GeoJSON
    if download_geojson(STATES_GEOJSON_URL, states_geojson_path):
        print("✅ State boundaries GeoJSON downloaded successfully!")
    else:
        print("⚠️ Failed to download state boundaries GeoJSON directly. Trying shapefile...")
        # Try shapefile method
        states_dir = DATA_DIR / "states"
        states_dir.mkdir(exist_ok=True)
        if download_and_extract_shapefile(STATES_URL, states_dir):
            print("✅ State boundaries shapefile downloaded successfully!")
            # Convert to GeoJSON
            convert_shapefile_to_geojson(states_dir, states_geojson_path)
        else:
            print("❌ Failed to download state boundaries.")
    
    # Download county boundaries GeoJSON
    if download_geojson(COUNTIES_GEOJSON_URL, counties_geojson_path):
        print("✅ County boundaries GeoJSON downloaded successfully!")
    else:
        print("⚠️ Failed to download county boundaries GeoJSON directly. Trying shapefile...")
        # Try shapefile method
        counties_dir = DATA_DIR / "counties"
        counties_dir.mkdir(exist_ok=True)
        if download_and_extract_shapefile(COUNTIES_URL, counties_dir):
            print("✅ County boundaries shapefile downloaded successfully!")
            # Convert to GeoJSON
            convert_shapefile_to_geojson(counties_dir, counties_geojson_path)
        else:
            print("❌ Failed to download county boundaries.")

if __name__ == "__main__":
    download_geo_data() 