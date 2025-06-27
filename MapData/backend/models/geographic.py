from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from sqlalchemy.dialects.postgresql import JSONB, UUID

from models.base import BaseModel


class State(BaseModel):
    """Model representing a US state with geographic boundaries."""
    
    __tablename__ = "states"
    
    name = Column(String(100), nullable=False, index=True)
    abbreviation = Column(String(2), nullable=False, index=True, unique=True)
    fips_code = Column(String(2), nullable=False, index=True, unique=True)
    population = Column(Integer)
    area_sq_miles = Column(Float)
    
    # Geographic data
    geometry = Column(Geometry('MULTIPOLYGON', srid=4326), nullable=False)
    
    # Additional properties stored as JSON
    properties = Column(JSONB)
    
    # Relationship with counties
    counties = relationship("County", back_populates="state")
    
    def __repr__(self):
        return f"<State {self.name} ({self.abbreviation})>"


class County(BaseModel):
    """Model representing a US county with geographic boundaries."""
    
    __tablename__ = "counties"
    
    name = Column(String(100), nullable=False)
    fips_code = Column(String(5), nullable=False, index=True, unique=True)
    state_id = Column(UUID, ForeignKey("states.id"), nullable=False, index=True)
    area_sq_miles = Column(Float)
    population = Column(Integer)
    
    # Geographic data
    geometry = Column(Geometry('MULTIPOLYGON', srid=4326), nullable=False)
    centroid = Column(Geometry('POINT', srid=4326))
    
    # Additional properties stored as JSON
    properties = Column(JSONB)
    
    # Relationship with state
    state = relationship("State", back_populates="counties")
    
    def __repr__(self):
        return f"<County {self.name} (FIPS: {self.fips_code})>" 