# FastAPI Standards for MapData Project

## Overview

This document outlines the standards and best practices for developing the FastAPI backend for the MapData project, with a focus on performance, modularity, and maintainability.

## Project Structure

### Directory Organization

```
backend/
├── app.py                # Application entry point
├── config.py             # Configuration settings
├── database.py           # Database connection management
├── models/               # SQLAlchemy models
│   ├── __init__.py
│   ├── base.py           # Base model class
│   ├── geographic.py     # Geographic data models
│   └── ...
├── schemas/              # Pydantic schemas
│   ├── __init__.py
│   ├── geographic.py     # Geographic data schemas
│   └── ...
├── routes/               # API routes
│   ├── __init__.py
│   ├── geographic.py     # Geographic data endpoints
│   └── ...
├── services/             # Business logic
│   ├── __init__.py
│   ├── geographic.py     # Geographic data services
│   └── ...
├── utils/                # Utility functions
│   ├── __init__.py
│   ├── geometry.py       # Geometry utilities
│   └── ...
└── tests/                # Test files
    ├── __init__.py
    ├── test_routes/
    ├── test_services/
    └── ...
```

### File Organization

Each Python file should follow this general structure:

```python
"""
Module docstring describing the purpose of the file.
"""
# 1. Standard library imports
import json
from typing import List, Optional

# 2. Third-party imports
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

# 3. Local application imports
from app.database import get_db
from app.models.geographic import State
from app.schemas.geographic import StateCreate, StateResponse

# 4. Constants
ROUTER_PREFIX = "/states"
DEFAULT_LIMIT = 100

# 5. Router or main object definition
router = APIRouter(prefix=ROUTER_PREFIX, tags=["states"])

# 6. Functions and route handlers
@router.get("/", response_model=List[StateResponse])
async def get_states(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = Query(DEFAULT_LIMIT, le=1000),
):
    """
    Get a list of states with pagination.
    """
    states = db.query(State).offset(skip).limit(limit).all()
    return states
```

## API Design

### Endpoint Naming

- Use plural nouns for resources (e.g., `/states`, `/counties`)
- Use kebab-case for multi-word resources (e.g., `/demographic-data`)
- Use nested routes for resource relationships (e.g., `/states/{state_id}/counties`)
- Use verbs for actions that don't fit CRUD operations (e.g., `/states/{state_id}/simplify`)

### HTTP Methods

- `GET`: Retrieve resources
- `POST`: Create resources
- `PUT`: Update resources (full replacement)
- `PATCH`: Partial update of resources
- `DELETE`: Remove resources

### Response Formats

- Use consistent response formats
- Include status codes, data, and messages
- Example:

```python
@router.get("/{state_id}")
async def get_state(state_id: int, db: Session = Depends(get_db)):
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="State not found")
    return state
```

### Query Parameters

- Use for filtering, sorting, pagination, and field selection
- Document all parameters with descriptions and examples
- Example:

```python
@router.get("/")
async def get_states(
    db: Session = Depends(get_db),
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, le=1000, description="Maximum number of records to return"),
    name: Optional[str] = Query(None, description="Filter by state name"),
    order_by: str = Query("name", description="Field to order by"),
    desc: bool = Query(False, description="Order in descending order"),
):
    """
    Get a list of states with filtering and pagination.
    """
    query = db.query(State)
    
    # Apply filters
    if name:
        query = query.filter(State.name.ilike(f"%{name}%"))
    
    # Apply ordering
    if order_by:
        order_column = getattr(State, order_by, State.name)
        if desc:
            order_column = order_column.desc()
        query = query.order_by(order_column)
    
    # Apply pagination
    states = query.offset(skip).limit(limit).all()
    return states
```

## Performance Optimization

### Asynchronous Operations

- Use async/await for I/O-bound operations
- Use threadpool for CPU-bound operations
- Example:

```python
@router.get("/states/{state_id}/demographics")
async def get_state_demographics(state_id: int):
    """
    Get demographic data for a state (I/O-bound operation).
    """
    # This is an I/O-bound operation, so we use async
    demographics = await fetch_demographics_from_database(state_id)
    return demographics

@router.get("/states/{state_id}/simplify")
async def simplify_state_geometry(
    state_id: int, 
    tolerance: float = Query(0.01, description="Simplification tolerance")
):
    """
    Simplify state geometry (CPU-bound operation).
    """
    # This is a CPU-bound operation, so we use a threadpool
    from concurrent.futures import ThreadPoolExecutor
    
    state = get_state_by_id(state_id)
    
    with ThreadPoolExecutor() as executor:
        simplified_geometry = await asyncio.get_event_loop().run_in_executor(
            executor, 
            simplify_geometry, 
            state.geometry, 
            tolerance
        )
    
    return {"geometry": simplified_geometry}
```

### Database Optimization

- Use SQLAlchemy efficiently
- Select only needed columns
- Use appropriate joins
- Example:

```python
# Inefficient
states = db.query(State).all()

# Efficient - select only needed columns
states = db.query(State.id, State.name).all()

# Efficient - eager loading related data when needed
states = db.query(State).options(
    selectinload(State.counties)
).filter(State.population > 1000000).all()
```

### Response Size Optimization

- Implement pagination for all list endpoints
- Use projection to return only needed fields
- Compress large responses
- Example:

```python
@router.get("/states/{state_id}/geometry")
async def get_state_geometry(
    state_id: int,
    simplify: float = Query(None, description="Simplification tolerance"),
    db: Session = Depends(get_db)
):
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="State not found")
    
    geometry = state.geometry
    
    # Apply simplification if requested
    if simplify is not None:
        geometry = simplify_geometry(geometry, simplify)
    
    # Use GZip compression for large geometries
    from fastapi.responses import Response
    import gzip
    import json
    
    content = json.dumps(geometry).encode("utf-8")
    if len(content) > 1024:  # Only compress if larger than 1KB
        content = gzip.compress(content)
        return Response(
            content=content,
            media_type="application/json",
            headers={"Content-Encoding": "gzip"}
        )
    
    return {"geometry": geometry}
```

### Caching

- Implement caching for frequently accessed, rarely changing data
- Use Redis or in-memory caching
- Example:

```python
from functools import lru_cache
from datetime import timedelta
from fastapi_cache.decorator import cache

@router.get("/states")
@cache(expire=timedelta(hours=1))
async def get_all_states():
    """
    Get all states (cached for 1 hour).
    """
    # This result will be cached
    return db.query(State).all()

# For memory-intensive but frequently used data
@lru_cache(maxsize=100)
def get_simplified_geometry(geometry_id: int, tolerance: float = 0.01):
    """
    Get and cache simplified geometry.
    """
    geometry = db.query(Geometry).get(geometry_id)
    return simplify_geometry(geometry.data, tolerance)
```

## Data Validation and Serialization

### Pydantic Schemas

- Define clear input and output schemas
- Use strict validation for inputs
- Example:

```python
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from geojson_pydantic import Polygon

class StateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    abbreviation: str = Field(..., min_length=2, max_length=2)
    
    @validator('abbreviation')
    def abbreviation_must_be_uppercase(cls, v):
        if v != v.upper():
            raise ValueError('abbreviation must be uppercase')
        return v

class StateCreate(StateBase):
    geometry: Polygon
    population: Optional[int] = Field(None, ge=0)

class StateResponse(StateBase):
    id: int
    geometry: Polygon
    population: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
```

### Request Validation

- Validate all request inputs
- Use appropriate field constraints
- Example:

```python
@router.post("/states")
async def create_state(
    state: StateCreate,
    db: Session = Depends(get_db)
):
    # Input is already validated by Pydantic
    db_state = State(**state.dict())
    db.add(db_state)
    db.commit()
    db.refresh(db_state)
    return db_state
```

## Error Handling

### Exception Handling

- Use appropriate HTTP status codes
- Provide clear error messages
- Example:

```python
@router.get("/states/{state_id}")
async def get_state(state_id: int, db: Session = Depends(get_db)):
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        raise HTTPException(
            status_code=404,
            detail=f"State with id {state_id} not found"
        )
    return state
```

### Global Exception Handler

- Implement a global exception handler for consistent error responses
- Example:

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

app = FastAPI()

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"message": "Database error occurred", "detail": str(exc)},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred", "detail": str(exc)},
    )
```

## Authentication and Authorization

### JWT Authentication

- Implement JWT-based authentication
- Example:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

SECRET_KEY = "your-secret-key"  # Store in environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user

@router.get("/protected-resource")
async def get_protected_resource(current_user = Depends(get_current_user)):
    return {"message": "You have access to this protected resource", "user": current_user}
```

### Role-Based Access Control

- Implement role-based access control for different permissions
- Example:

```python
def get_current_active_admin(current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.post("/admin-only-resource")
async def create_admin_resource(
    data: AdminResourceCreate,
    current_user = Depends(get_current_active_admin)
):
    # Only admins can access this endpoint
    return {"message": "Admin resource created", "data": data}
```

## Testing

### Test Organization

- Organize tests by module or feature
- Use descriptive test names
- Example:

```
tests/
├── conftest.py             # Shared fixtures
├── test_routes/
│   ├── test_states.py
│   └── ...
├── test_services/
│   ├── test_geographic.py
│   └── ...
└── ...
```

### Test Fixtures

- Use fixtures for common test setup
- Example:

```python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# Create test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    # Create the database and tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for each test
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        
    # Drop the database after the test
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    # Override the get_db dependency
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides = {}
```

### API Tests

- Test all API endpoints
- Test both success and error cases
- Example:

```python
# test_routes/test_states.py
def test_get_states(client):
    response = client.get("/states/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_state_by_id(client, db):
    # Create a test state
    from app.models.geographic import State
    test_state = State(name="Test State", abbreviation="TS")
    db.add(test_state)
    db.commit()
    
    # Test getting the state
    response = client.get(f"/states/{test_state.id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test State"
    
    # Test getting a non-existent state
    response = client.get("/states/9999")
    assert response.status_code == 404
```

## Documentation

### API Documentation

- Use FastAPI's automatic documentation
- Add detailed docstrings to all endpoints
- Example:

```python
@router.get(
    "/states/{state_id}",
    response_model=StateResponse,
    responses={
        404: {"description": "State not found"},
        500: {"description": "Database error"}
    }
)
async def get_state(
    state_id: int = Path(..., description="The ID of the state to retrieve"),
    db: Session = Depends(get_db)
):
    """
    Get a single state by ID.
    
    This endpoint retrieves detailed information about a specific state,
    including its geometry and demographic data.
    
    - **state_id**: The unique identifier of the state
    
    Returns a StateResponse object with all state details.
    """
    state = db.query(State).filter(State.id == state_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="State not found")
    return state
```

### Code Documentation

- Add docstrings to all functions, classes, and modules
- Follow Google or NumPy docstring style
- Example:

```python
def simplify_geometry(geometry: dict, tolerance: float = 0.01) -> dict:
    """
    Simplify a GeoJSON geometry using the Douglas-Peucker algorithm.
    
    Args:
        geometry: A GeoJSON geometry object
        tolerance: The simplification tolerance (higher = more simplification)
        
    Returns:
        A simplified GeoJSON geometry object
        
    Raises:
        ValueError: If the geometry is not valid GeoJSON
    """
    # Implementation
```

## Deployment

### Environment Variables

- Use environment variables for configuration
- Don't hardcode sensitive information
- Example:

```python
# config.py
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/mapdata")
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "development-secret-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Docker Configuration

- Use Docker for consistent deployment
- Example Dockerfile:

```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Appendix: Best Practices Checklist

Before considering an API endpoint complete, ensure it meets these criteria:

- [ ] Uses appropriate HTTP method
- [ ] Has clear input validation
- [ ] Returns appropriate status codes
- [ ] Has proper error handling
- [ ] Is properly documented
- [ ] Has tests
- [ ] Is optimized for performance
- [ ] Follows security best practices
- [ ] Has appropriate authentication/authorization 