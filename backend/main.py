from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
# 1. Add the agents import here
from routes import analytics, csv_import, agents 

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lead Analytics Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Include the new agents router
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(csv_import.router, prefix="/api", tags=["csv"])
app.include_router(agents.router, prefix="/api", tags=["agents"]) 

@app.get("/")
def root():
    return {"message": "Lead Analytics API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}