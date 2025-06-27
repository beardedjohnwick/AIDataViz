from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Use absolute imports instead of relative imports
from config import API_PREFIX
from routes import geographic

# Create FastAPI app
app = FastAPI(
    title="MapData API",
    description="API for geographic and statistical data visualization",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(geographic.router, prefix=API_PREFIX)

@app.get("/")
async def root():
    return {"message": "Welcome to MapData API. Go to /docs for API documentation."} 