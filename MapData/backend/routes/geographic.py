from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
import json
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping

from database import get_db
from models import geographic as models
from schemas import geographic as schemas

router = APIRouter(
    prefix="/geographic",
    tags=["geographic"],
)

@router.get("/health")
async def health_check():
    """Health check endpoint for geographic data services."""
    return {"status": "ok", "message": "Geographic data service is running"}


@router.get("/states", response_model=schemas.GeoJSONFeatureCollection)
async def get_states(
    include_geometry: bool = Query(False, description="Include geometry in response"),
    db: Session = Depends(get_db)
):
    """
    Get all states, optionally with their geometry.
    """
    states = db.query(models.State).all()
    
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
    
    return schemas.GeoJSONFeatureCollection(features=features)


@router.get("/counties", response_model=schemas.GeoJSONFeatureCollection)
async def get_counties(
    include_geometry: bool = Query(False, description="Include geometry in response"),
    state_id: Optional[str] = Query(None, description="Filter counties by state ID"),
    db: Session = Depends(get_db)
):
    """
    Get all counties, optionally filtered by state and with their geometry.
    """
    query = db.query(models.County)
    
    if state_id:
        query = query.filter(models.County.state_id == state_id)
    
    counties = query.all()
    
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
    
    return schemas.GeoJSONFeatureCollection(features=features) 