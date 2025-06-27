import json
from pathlib import Path

# Directory with GeoJSON files
DATA_DIR = Path("data/raw_geo")
COUNTIES_GEOJSON = DATA_DIR / "counties.geojson"
STATES_GEOJSON = DATA_DIR / "states.geojson"

def examine_geojson(file_path):
    """Examine a GeoJSON file structure."""
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        print(f"\nExamining {file_path}:")
        print(f"Type: {data.get('type', 'Unknown')}")
        print(f"Number of features: {len(data.get('features', []))}")
        
        if data.get('features'):
            # Examine first feature
            first_feature = data['features'][0]
            print("\nFirst feature structure:")
            print(f"Type: {first_feature.get('type', 'Unknown')}")
            
            # Examine properties
            if 'properties' in first_feature:
                print("\nProperties keys:")
                for key in first_feature['properties'].keys():
                    print(f"- {key}: {type(first_feature['properties'][key]).__name__}")
            
            # Examine geometry
            if 'geometry' in first_feature:
                print("\nGeometry structure:")
                print(f"Type: {first_feature['geometry'].get('type', 'Unknown')}")
                
                # Check coordinates structure
                if 'coordinates' in first_feature['geometry']:
                    coords = first_feature['geometry']['coordinates']
                    print(f"Coordinates type: {type(coords).__name__}")
                    print(f"Coordinates depth: {get_nesting_depth(coords)}")
        
        return True
    except Exception as e:
        print(f"Error examining GeoJSON file {file_path}: {e}")
        return False

def get_nesting_depth(obj, depth=0):
    """Get the nesting depth of a nested list/array."""
    if isinstance(obj, list) and len(obj) > 0:
        return get_nesting_depth(obj[0], depth + 1)
    return depth

if __name__ == "__main__":
    print("Examining GeoJSON files...")
    examine_geojson(STATES_GEOJSON)
    examine_geojson(COUNTIES_GEOJSON) 