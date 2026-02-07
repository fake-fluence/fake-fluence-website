"""Video API schemas."""

from pydantic import BaseModel, Field


class CreateVideoRequest(BaseModel):
    """Request body for POST /videos/generate."""

    prompt: str = Field(..., min_length=1, description="Text description of the video")
    model: str = Field(default="sora-2", description="sora-2 or sora-2-pro")
    seconds: str = Field(default="4", description="Duration: 4, 8, or 12")
    size: str = Field(default="720x1280", description="Resolution")


class RemixVideoRequest(BaseModel):
    """Request body for POST /videos/remix."""

    video_id: str = Field(..., min_length=1, description="Job ID from a previous create or remix")
    prompt: str = Field(..., min_length=1, description="New prompt for the remix")


class VideoJobResponse(BaseModel):
    """Response after creating a video or remix job."""

    job_id: str = Field(..., description="OpenAI video job ID; use for status and download")


class VideoStatusResponse(BaseModel):
    """Response for GET /videos/jobs/{id}/status."""

    job_id: str
    status: str = Field(..., description="pending | completed | failed")
