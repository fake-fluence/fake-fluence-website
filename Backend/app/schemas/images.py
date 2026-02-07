"""Image API schemas."""

from pydantic import BaseModel, Field


class GenerateImageRequest(BaseModel):
    """Request body for POST /images/generate."""

    prompt: str = Field(..., min_length=1, description="Text description of the image")
    model: str = Field(default="gpt-image-1.5", description="Model name")
    size: str | None = Field(default=None, description="e.g. 1024x1024, auto for gpt-image")
    quality: str | None = Field(default=None, description="e.g. hd, standard, high, medium, low")
    n: int = Field(default=1, ge=1, le=4, description="Number of images (DALL-E 3 only supports 1)")
    style: str | None = Field(default=None, description="DALL-E 3: vivid | natural")
