import requests
import json
import sys

# API endpoint URL
API_URL = "http://localhost:8000/api/v1/geographic/states"

def test_states_api():
    """Test the states API endpoint to verify it returns proper GeoJSON data."""
    print("Testing states API endpoint...")
    
    try:
        # Make a request to the API with include_geometry=true
        response = requests.get(API_URL, params={"include_geometry": True})
        
        # Check if the request was successful
        if response.status_code == 200:
            print(f"✅ API request successful (status code: {response.status_code})")
            
            # Parse the JSON response
            data = response.json()
            
            # Check if the response is a valid GeoJSON FeatureCollection
            if data.get("type") == "FeatureCollection" and "features" in data:
                print(f"✅ Response is a valid GeoJSON FeatureCollection with {len(data['features'])} features")
                
                # Check if we have features
                if len(data["features"]) > 0:
                    # Check the first feature
                    first_feature = data["features"][0]
                    
                    # Check if the feature has properties and geometry
                    if "properties" in first_feature and "geometry" in first_feature:
                        print("✅ Features have properties and geometry")
                        
                        # Check if area_sq_miles is in properties
                        if "area_sq_miles" in first_feature["properties"]:
                            area = first_feature["properties"]["area_sq_miles"]
                            name = first_feature["properties"]["name"]
                            print(f"✅ area_sq_miles found in properties: {name} = {area} sq miles")
                        else:
                            print("❌ area_sq_miles not found in properties")
                            
                        # Print a sample of the properties
                        print("\nSample properties from first feature:")
                        for key, value in first_feature["properties"].items():
                            print(f"  - {key}: {value}")
                    else:
                        print("❌ Features missing properties or geometry")
                else:
                    print("❌ No features found in the response")
            else:
                print("❌ Response is not a valid GeoJSON FeatureCollection")
                print(f"Actual response type: {data.get('type', 'unknown')}")
        else:
            print(f"❌ API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Could not connect to the API server")
        print("Make sure the FastAPI server is running (uvicorn app:app --reload)")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_states_api() 