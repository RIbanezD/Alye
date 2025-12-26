from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from config.database import init_db, SessionLocal
from config.seeds import seed_all
from api.routes import auth, projects, targets, vulnerabilities, conversations, llm, files, exports

# Initialize database
init_db()

db = SessionLocal()
try:
    seed_all(db)
finally:
    db.close()

app = FastAPI(
    title="Pentesting Assistant API",
    description="Authentication and Authorization API for pentesting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(targets.router, prefix="/api")
app.include_router(vulnerabilities.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(llm.router, prefix="/api")
app.include_router(files.router, prefix="/api")
app.include_router(exports.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Pentesting Assistant API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )