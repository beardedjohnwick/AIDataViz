from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
import json
import logging
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping

from database import get_db
from models import geographic as models
from schemas import geographic as schemas

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/geographic",
    tags=["geographic"],
    responses={404: {"description": "Not found"}},
)

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the geographic API.
    """
    return {"status": "ok", "message": "Geographic data service is running"}

@router.get("/states", response_model=schemas.GeoJSONFeatureCollection)
async def get_states(
    db = Depends(get_db),
    include_geometry: bool = Query(True, description="Include geometry in response")
):
    """
    Get all states, optionally with their geometry.
    """
    states = db.query(models.State).all()
    
    # Log all state names for debugging
    state_names = [state.name for state in states]
    logger.info(f"All state names in database: {state_names}")
    
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
        
        # Log Alaska data for debugging
        if state.name == 'Alaska' or state.fips_code == '02':
            logger.info(f"Alaska data found in backend: {state.name}, FIPS: {state.fips_code}, ID: {state.id}")
            logger.info(f"Alaska properties: {properties}")
            if include_geometry:
                shape = to_shape(state.geometry)
                logger.info(f"Alaska geometry type: {shape.geom_type}")
                logger.info(f"Alaska geometry valid: {shape.is_valid}")
        
        # Log Hawaii data for debugging
        if state.name == 'Hawaii' or state.fips_code == '15':
            logger.info(f"Hawaii data found in backend: {state.name}, FIPS: {state.fips_code}, ID: {state.id}")
            logger.info(f"Hawaii properties: {properties}")
            if include_geometry:
                shape = to_shape(state.geometry)
                logger.info(f"Hawaii geometry type: {shape.geom_type}")
                logger.info(f"Hawaii geometry valid: {shape.is_valid}")
        
        geometry = None
        if include_geometry:
            # Convert PostGIS geometry to GeoJSON
            shape = to_shape(state.geometry)
            geometry = mapping(shape)
        else:
            # Placeholder point for when geometry is not included
            geometry = {
                "type": "Point",
                "coordinates": [0, 0]
            }
        
        feature = schemas.GeoJSONFeature(
            id=str(state.id),
            geometry=geometry,
            properties=properties
        )
        features.append(feature)
    
    # Log the number of features
    logger.info(f"Returning {len(features)} state features")
    
    # Check if Alaska is in the features
    alaska_features = [f for f in features if 
                       f.properties.get('name') == 'Alaska' or 
                       f.properties.get('fips_code') == '02']
    logger.info(f"Number of Alaska features in response: {len(alaska_features)}")
    
    # Check if Hawaii is in the features
    hawaii_features = [f for f in features if 
                       f.properties.get('name') == 'Hawaii' or 
                       f.properties.get('fips_code') == '15']
    logger.info(f"Number of Hawaii features in response: {len(hawaii_features)}")
    
    return schemas.GeoJSONFeatureCollection(features=features)

@router.get("/counties", response_model=schemas.GeoJSONFeatureCollection)
async def get_counties(
    db = Depends(get_db),
    include_geometry: bool = Query(True, description="Include geometry in response"),
    state_id: Optional[str] = Query(None, description="Filter counties by state ID")
):
    """
    Get all counties, optionally filtered by state and with their geometry.
    """
    query = db.query(models.County)
    
    if state_id:
        query = query.filter(models.County.state_id == state_id)
    
    counties = query.all()
    
    # Log the total number of counties
    logger.info(f"Total counties found: {len(counties)}")
    
    # Get Hawaii state ID for logging
    hawaii_state = db.query(models.State).filter(
        (models.State.name == 'Hawaii') | (models.State.fips_code == '15')
    ).first()
    
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
        if hawaii_state_id and county.state_id == hawaii_state_id:
            logger.info(f"Hawaii county found: {county.name}, FIPS: {county.fips_code}")
            if include_geometry:
                shape = to_shape(county.geometry)
                logger.info(f"Hawaii county geometry type: {shape.geom_type}")
                logger.info(f"Hawaii county geometry valid: {shape.is_valid}")
        
        geometry = None
        if include_geometry:
            # Convert PostGIS geometry to GeoJSON
            shape = to_shape(county.geometry)
            geometry = mapping(shape)
        else:
            # Placeholder point for when geometry is not included
            geometry = {
                "type": "Point",
                "coordinates": [0, 0]
            }
        
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
    if hawaii_state_id in state_counts:
        logger.info(f"Hawaii county features count: {state_counts[hawaii_state_id]}")
    
    return schemas.GeoJSONFeatureCollection(features=features) 