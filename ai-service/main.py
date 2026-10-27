from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ai_router
from app.services.llm_service import LLMService
from app.services.cache import cache
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AI Interviewer Service",
    description="AI microservice for interview question generation, evaluation, and analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,https://ai-interviewer-rho-hazel.vercel.app").split(",") if o.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-AI-Service-Token"],
)

app.include_router(ai_router.router, prefix="/ai", tags=["AI"])

llm_service = LLMService()

@app.get("/")
async def root():
    return {"message": "AI Interviewer Service is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-interviewer", "cache": cache.backend}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8001")))
