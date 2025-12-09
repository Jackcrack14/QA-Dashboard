from fastapi import APIRouter
from app.api.endpoints import questions, auth

api_router = APIRouter()
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])