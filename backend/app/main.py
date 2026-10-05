"""
PM-AJAY Voice Assistant API Main Entry Point.
SIH 2026 - Problem Statement ID: 26097
Organization: Ministry of Social Justice and Empowerment (MoSJE)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes_session import router as session_router
from app.api.routes_recommendations import router as rec_router
from app.api.routes_webhooks import router as webhook_router
from app.api.routes_admin import router as admin_router
from app.api.routes_integrations import router as integrations_router
from app.models.storage import db

app = FastAPI(
    title="PM-AJAY Voice Assistant API",
    description="Core backend API for the AI-Driven Voice Assistant for Livelihood Mapping & NSQF-Aligned Skilling Recommendations (SIH 2026 - ID 26097). Specialized for Ahirani (Maharashtra) and Telugu (AP/Telangana).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Kiosk PWA and Simulators
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(session_router)
app.include_router(rec_router)
app.include_router(webhook_router)
app.include_router(admin_router)
app.include_router(integrations_router)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "PM-AJAY Voice Assistant API",
        "supported_languages": ["ahr-IN (Ahirani)", "te-IN (Telugu)"],
        "nsqf_packs_loaded": len(db.nsqf_packs),
        "training_centers_loaded": len(db.training_centers),
        "active_sessions": len(db.sessions)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
