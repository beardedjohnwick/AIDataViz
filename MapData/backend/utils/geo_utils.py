from typing import Dict, Any, Optional, cast
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping, box
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_geometry_to_geojson(geometry_column):
    """
    Convert a PostGIS geometry to GeoJSON
    
    Args:
        geometry_column: PostGIS geometry column
        
    Returns:
        GeoJSON geometry object
    """
    if geometry_column is None:
        return {
            "type": "Point",
            "coordinates": [0, 0]
        }
    
    try:
        shape = to_shape(geometry_column)
        return mapping(shape)
    except Exception as e:
        logger.error(f"Error converting geometry to GeoJSON: {e}")
        return {
            "type": "Point",
            "coordinates": [0, 0]
        }

def create_placeholder_geometry():
    """
    Create a placeholder point geometry
    
    Returns:
        GeoJSON point geometry
    """
    return {
        "type": "Point",
        "coordinates": [0, 0]
    }

def is_alaska(properties: Dict[str, Any]) -> bool:
    """
    Check if a feature represents Alaska based on its properties
    
    Args:
        properties: Feature properties
        
    Returns:
        True if the feature represents Alaska
    """
    name = properties.get('name', '').lower()
    fips = properties.get('fips_code', '')
    return name == 'alaska' or fips == '02'

def is_hawaii(properties: Dict[str, Any]) -> bool:
    """
    Check if a feature represents Hawaii based on its properties
    
    Args:
        properties: Feature properties
        
    Returns:
        True if the feature represents Hawaii
    """
    name = properties.get('name', '').lower()
    fips = properties.get('fips_code', '')
    return name == 'hawaii' or fips == '15'

def get_bounding_box_filter(min_lon: float, min_lat: float, max_lon: float, max_lat: float) -> str:
    """
    Create a PostGIS ST_MakeEnvelope filter string for a bounding box
    
    Args:
        min_lon: Minimum longitude (west)
        min_lat: Minimum latitude (south)
        max_lon: Maximum longitude (east)
        max_lat: Maximum latitude (north)
        
    Returns:
        SQL string for filtering by bounding box
    """
    return f"ST_MakeEnvelope({min_lon}, {min_lat}, {max_lon}, {max_lat}, 4326)"

def create_bounding_box_filter(min_lon: Optional[float], min_lat: Optional[float], 
                              max_lon: Optional[float], max_lat: Optional[float]) -> Optional[str]:
    """
    Create a PostGIS ST_MakeEnvelope filter string for a bounding box, handling None values
    
    Args:
        min_lon: Minimum longitude (west)
        min_lat: Minimum latitude (south)
        max_lon: Maximum longitude (east)
        max_lat: Maximum latitude (north)
        
    Returns:
        SQL string for filtering by bounding box or None if any coordinate is None
    """
    if all(x is not None for x in [min_lon, min_lat, max_lon, max_lat]):
        # Type casting to ensure we're passing float values
        return get_bounding_box_filter(
            cast(float, min_lon), 
            cast(float, min_lat), 
            cast(float, max_lon), 
            cast(float, max_lat)
        )
    return None

def get_simplification_tolerance(zoom_level: Optional[int] = None) -> float:
    """
    Calculate an appropriate simplification tolerance based on zoom level
    
    Args:
        zoom_level: Map zoom level (1-20)
        
    Returns:
        Simplification tolerance value for PostGIS ST_SimplifyPreserveTopology
    """
    if zoom_level is None:
        return 0.01  # Default tolerance
    
    # Scale tolerance inversely with zoom level
    # Lower tolerance (more detail) at higher zoom levels
    tolerance_map = {
        5: 0.05,    # Country level
        6: 0.03,    # Region level
        7: 0.02,    # State level
        8: 0.01,    # Large counties
        9: 0.005,   # Counties
        10: 0.003,  # Small counties
        11: 0.002,  # City level
        12: 0.001,  # Neighborhood level
        13: 0.0005, # Streets level
        14: 0.0003, # Detailed streets
        15: 0.0001, # Buildings level
        16: 0.00005 # Detailed buildings
    }
    
    # For zoom levels not in the map, use closest value or extremes
    if zoom_level <= 5:
        return 0.05
    elif zoom_level >= 16:
        return 0.00005
    else:
        return tolerance_map.get(zoom_level, 0.01) 