"""Image generation and editing endpoints."""

import io

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from fastapi.responses import Response
from openai import OpenAI

from app.dependencies import get_openai_client
from app.schemas.images import GenerateImageRequest
from app.services.image_service import ImageService

router = APIRouter()


def _image_service(client: OpenAI = Depends(get_openai_client)) -> ImageService:
    return ImageService(client)


@router.post(
    "/generate",
    response_class=Response,
    responses={200: {"content": {"image/png": {}}}},
    summary="Generate image from prompt",
)
async def generate_image(
    body: GenerateImageRequest,
    service: ImageService = Depends(_image_service),
) -> Response:
    """
    Generate a single image from a text prompt. Returns PNG bytes.
    Uses gpt-image-1.5 by default; supports dall-e-2, dall-e-3, etc.
    """
    try:
        data = service.generate(
            body.prompt,
            model=body.model,
            size=body.size,
            quality=body.quality,
            n=body.n,
            style=body.style,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(content=data, media_type="image/png")


@router.post(
    "/edit",
    response_class=Response,
    responses={200: {"content": {"image/png": {}}}},
    summary="Edit image(s) with prompt",
)
async def edit_image(
    prompt: str = Form(..., description="Edit instruction (e.g. replace object in first image with object from second)"),
    model: str = Form("gpt-image-1.5"),
    files: list[UploadFile] = [],
    service: ImageService = Depends(_image_service),
) -> Response:
    """
    Edit one or more images with a text instruction. Send as multipart form:
    prompt, optional model, and one or more image files. Returns the edited image as PNG.
    """
    if not files:
        raise HTTPException(status_code=400, detail="At least one image file is required")
    buffers: list[io.BytesIO] = []
    for f in files:
        if not f.content_type or not f.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"File {f.filename or '?'} is not an image",
            )
        buffers.append(io.BytesIO(await f.read()))
    try:
        data = service.edit(prompt, buffers, model=model)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return Response(content=data, media_type="image/png")