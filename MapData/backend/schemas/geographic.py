from typing import Dict, Optional, Any, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class StateBase(BaseModel):
    """Base schema for State data."""
    name: str
    abbreviation: str
    fips_code: str
    population: Optional[int] = None
    area_sq_mi: Optional[float] = None
    properties: Optional[Dict[str, Any]] = None


class StateCreate(StateBase):
    """Schema for creating a new State."""
    # GeoJSON geometry for the state boundaries
    geometry: Dict[str, Any]


class StateResponse(StateBase):
    """Schema for State response."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CountyBase(BaseModel):
    """Base schema for County data."""
    name: str
    fips_code: str
    state_id: UUID
    area_sq_miles: Optional[float] = None
    population: Optional[int] = None
    properties: Optional[Dict[str, Any]] = None


class CountyCreate(CountyBase):
    """Schema for creating a new County."""
    # GeoJSON geometry for the county boundaries
    geometry: Dict[str, Any]


class CountyResponse(CountyBase):
    """Schema for County response."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class GeoJSONFeature(BaseModel):
    """GeoJSON Feature schema."""
    type: str = "Feature"
    id: str
    geometry: Dict[str, Any]
    properties: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    """GeoJSON FeatureCollection schema."""
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature] 