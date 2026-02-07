"""API route modules."""

from fastapi import APIRouter

from app.routers import images, videos

api_router = APIRouter(prefix="/api", tags=["api"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(videos.router, prefix="/videos", tags=["videos"])

__all__ = ["api_router"]
