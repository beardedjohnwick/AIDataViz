from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging

from models import geographic as models
from schemas import geographic as schemas
from utils.geo_utils import (
    convert_geometry_to_geojson, 
    create_placeholder_geometry, 
    is_alaska, 
    is_hawaii,
    create_bounding_box_filter,
    get_simplification_tolerance
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    """Service class for database operations related to geographic data"""
    
    @staticmethod
    def get_all_states(
        db: Session, 
        include_geometry: bool = True,
        tolerance: Optional[float] = None,
        zoom_level: Optional[int] = None,
        min_lon: Optional[float] = None,
        min_lat: Optional[float] = None,
        max_lon: Optional[float] = None,
        max_lat: Optional[float] = None
    ) -> List[schemas.GeoJSONFeature]:
        """
        Get all states from the database
        
        Args:
            db: Database session
            include_geometry: Whether to include geometry in the response
            tolerance: Simplification tolerance for geometry (degrees)
            zoom_level: Map zoom level (used to calculate tolerance if not provided)
            min_lon: Minimum longitude for bounding box filter
            min_lat: Minimum latitude for bounding box filter
            max_lon: Maximum longitude for bounding box filter
            max_lat: Maximum latitude for bounding box filter
            
        Returns:
            List of state features
        """
        # Start building the query
        query = db.query(models.State)
        
        # Apply bounding box filter if all coordinates are provided
        bbox_filter = create_bounding_box_filter(min_lon, min_lat, max_lon, max_lat)
        if bbox_filter:
            logger.info(f"Filtering states by bounding box: {min_lon}, {min_lat}, {max_lon}, {max_lat}")
            query = query.filter(text(f"ST_Intersects(geometry, {bbox_filter})"))
        
        # Execute the query
        states = query.all()
        
        # Log all state names for debugging
        state_names = [state.name for state in states]
        logger.info(f"All state names in database: {state_names}")
        
        # Determine simplification tolerance
        if tolerance is None and zoom_level is not None:
            tolerance = get_simplification_tolerance(zoom_level)
            logger.info(f"Using calculated tolerance for states: {tolerance} based on zoom level {zoom_level}")
        elif tolerance is not None:
            logger.info(f"Using provided tolerance for states: {tolerance}")
        
        features = []
        for state in states:
            properties: Dict[str, Any] = {
                "name": state.name,
                "abbreviation": state.abbreviation,
                "fips_code": state.fips_code,
                "id": str(state.id),
            }
            
            if state.population is not None:
                properties["population"] = state.population
            
            if state.area_sq_miles is not None:
                properties["area_sq_miles"] = state.area_sq_miles
                
            if state.properties is not None:
                # Add each key-value pair from properties
                for key, value in state.properties.items():
                    properties[key] = value
            
            # Log Alaska and Hawaii data for debugging
            if state.name == 'Alaska' or state.fips_code == '02':
                logger.info(f"Alaska data found in backend: {state.name}, FIPS: {state.fips_code}, ID: {state.id}")
                logger.info(f"Alaska properties: {properties}")
            
            if state.name == 'Hawaii' or state.fips_code == '15':
                logger.info(f"Hawaii data found in backend: {state.name}, FIPS: {state.fips_code}, ID: {state.id}")
                logger.info(f"Hawaii properties: {properties}")
            
            # Process geometry based on include_geometry flag
            if include_geometry:
                if tolerance is not None and tolerance > 0:
                    # Use simplified geometry
                    simplified_geom = db.scalar(
                        text(f"SELECT ST_SimplifyPreserveTopology(geometry, {tolerance}) FROM states WHERE id = :id"),
                        {"id": state.id}
                    )
                    geometry = convert_geometry_to_geojson(simplified_geom)
                else:
                    # Use original geometry
                    geometry = convert_geometry_to_geojson(state.geometry)
            else:
                geometry = create_placeholder_geometry()
            
            feature = schemas.GeoJSONFeature(
                id=str(state.id),
                geometry=geometry,
                properties=properties
            )
            features.append(feature)
        
        # Log the number of features
        logger.info(f"Returning {len(features)} state features")
        
        # Check if Alaska is in the features
        alaska_features = [f for f in features if is_alaska(f.properties)]
        logger.info(f"Number of Alaska features in response: {len(alaska_features)}")
        
        # Check if Hawaii is in the features
        hawaii_features = [f for f in features if is_hawaii(f.properties)]
        logger.info(f"Number of Hawaii features in response: {len(hawaii_features)}")
        
        return features
    
    @staticmethod
    def get_counties(
        db: Session, 
        include_geometry: bool = True, 
        state_id: Optional[str] = None,
        tolerance: Optional[float] = None,
        zoom_level: Optional[int] = None,
        min_lon: Optional[float] = None,
        min_lat: Optional[float] = None,
        max_lon: Optional[float] = None,
        max_lat: Optional[float] = None
    ) -> List[schemas.GeoJSONFeature]:
        """
        Get counties from the database, optionally filtered by state
        
        Args:
            db: Database session
            include_geometry: Whether to include geometry in the response
            state_id: Optional state ID to filter counties
            tolerance: Simplification tolerance for geometry (degrees)
            zoom_level: Map zoom level (used to calculate tolerance if not provided)
            min_lon: Minimum longitude for bounding box filter
            min_lat: Minimum latitude for bounding box filter
            max_lon: Maximum longitude for bounding box filter
            max_lat: Maximum latitude for bounding box filter
            
        Returns:
            List of county features
        """
        # Start building the query
        query = db.query(models.County)
        
        # Apply state filter if provided
        if state_id:
            query = query.filter(models.County.state_id == state_id)
        
        # Apply bounding box filter if all coordinates are provided
        bbox_filter = create_bounding_box_filter(min_lon, min_lat, max_lon, max_lat)
        if bbox_filter:
            logger.info(f"Filtering counties by bounding box: {min_lon}, {min_lat}, {max_lon}, {max_lat}")
            query = query.filter(text(f"ST_Intersects(geometry, {bbox_filter})"))
        
        # Execute the query
        counties = query.all()
        
        # Log the total number of counties
        logger.info(f"Total counties found: {len(counties)}")
        
        # Determine simplification tolerance
        if tolerance is None and zoom_level is not None:
            tolerance = get_simplification_tolerance(zoom_level)
            logger.info(f"Using calculated tolerance for counties: {tolerance} based on zoom level {zoom_level}")
        elif tolerance is not None:
            logger.info(f"Using provided tolerance for counties: {tolerance}")
        
        # Get Hawaii state ID for logging
        hawaii_state = None
        hawaii_query = db.query(models.State).filter(models.State.name == 'Hawaii')
        if hawaii_query.count() > 0:
            hawaii_state = hawaii_query.first()
        else:
            hawaii_query = db.query(models.State).filter(models.State.fips_code == '15')
            if hawaii_query.count() > 0:
                hawaii_state = hawaii_query.first()
        
        hawaii_state_id = str(hawaii_state.id) if hawaii_state else None
        logger.info(f"Hawaii state ID: {hawaii_state_id}")
        
        # Count Hawaii counties
        if hawaii_state_id:
            hawaii_counties = db.query(models.County).filter(models.County.state_id == hawaii_state_id).all()
            logger.info(f"Number of Hawaii counties in database: {len(hawaii_counties)}")
            if hawaii_counties:
                for county in hawaii_counties[:3]:  # Log first 3 counties
                    logger.info(f"Hawaii county example: {county.name}, FIPS: {county.fips_code}")
        
        features = []
        for county in counties:
            properties: Dict[str, Any] = {
                "name": county.name,
                "fips_code": county.fips_code,
                "state_id": str(county.state_id),
                "id": str(county.id),
            }
            
            if county.population is not None:
                properties["population"] = county.population
            
            if county.area_sq_miles is not None:
                properties["area_sq_miles"] = county.area_sq_miles
                
            if county.properties is not None:
                # Add each key-value pair from properties
                for key, value in county.properties.items():
                    properties[key] = value
            
            # Log Alaska county data for debugging
            if state_id and state_id == "b2785b90-a07d-4f9a-90d7-10edc3a6fe00":  # Alaska ID
                logger.info(f"Alaska county data: {county.name}, FIPS: {county.fips_code}")
            
            # Log Hawaii county data for debugging
            if hawaii_state_id and str(county.state_id) == hawaii_state_id:
                logger.info(f"Hawaii county found: {county.name}, FIPS: {county.fips_code}")
            
            # Process geometry based on include_geometry flag
            if include_geometry:
                if tolerance is not None and tolerance > 0:
                    # Use simplified geometry
                    simplified_geom = db.scalar(
                        text(f"SELECT ST_SimplifyPreserveTopology(geometry, {tolerance}) FROM counties WHERE id = :id"),
                        {"id": county.id}
                    )
                    geometry = convert_geometry_to_geojson(simplified_geom)
                else:
                    # Use original geometry
                    geometry = convert_geometry_to_geojson(county.geometry)
            else:
                geometry = create_placeholder_geometry()
            
            feature = schemas.GeoJSONFeature(
                id=str(county.id),
                geometry=geometry,
                properties=properties
            )
            features.append(feature)
        
        # Count features by state for debugging
        state_counts = {}
        for feature in features:
            state_id = feature.properties.get('state_id')
            if state_id not in state_counts:
                state_counts[state_id] = 0
            state_counts[state_id] += 1
        
        # Log counts for Alaska and Hawaii
        logger.info(f"County features by state: {state_counts}")
        if hawaii_state_id and hawaii_state_id in state_counts:
            logger.info(f"Hawaii county features count: {state_counts[hawaii_state_id]}")
        
        return features 