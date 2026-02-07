"""Video generation and remix endpoints."""

import io

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from openai import OpenAI

from app.dependencies import get_openai_client
from app.schemas.videos import (
    CreateVideoRequest,
    RemixVideoRequest,
    VideoJobResponse,
    VideoStatusResponse,
)
from app.services.video_service import VideoService

router = APIRouter()


def _video_service(client: OpenAI = Depends(get_openai_client)) -> VideoService:
    return VideoService(client)


@router.post(
    "/generate",
    response_model=VideoJobResponse,
    summary="Start video generation",
)
async def create_video(
    body: CreateVideoRequest,
    service: VideoService = Depends(_video_service),
) -> VideoJobResponse:
    """
    Start a video generation job. Returns job_id. Poll GET /videos/jobs/{id}/status
    until status is completed, then GET /videos/jobs/{id}/download to get the MP4.
    """
    try:
        job_id = service.create(
            body.prompt,
            model=body.model,
            seconds=body.seconds,
            size=body.size,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return VideoJobResponse(job_id=job_id)


@router.post(
    "/generate-with-reference",
    response_model=VideoJobResponse,
    summary="Start video generation with image reference",
)
async def create_video_with_reference(
    prompt: str = Form(...),
    model: str = Form("sora-2"),
    seconds: str = Form("4"),
    size: str = Form("720x1280"),
    reference: UploadFile = File(...),
    service: VideoService = Depends(_video_service),
) -> VideoJobResponse:
    """
    Start a video generation job with an image reference. Send as multipart form.
    Same flow as POST /videos/generate: poll status then download.
    """
    ref_bytes = await reference.read()
    try:
        job_id = service.create(
            prompt,
            model=model,
            seconds=seconds,
            size=size,
            input_reference=io.BytesIO(ref_bytes),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return VideoJobResponse(job_id=job_id)


@router.get(
    "/jobs/{job_id}/status",
    response_model=VideoStatusResponse,
    summary="Get video job status",
)
async def get_video_status(
    job_id: str,
    service: VideoService = Depends(_video_service),
) -> VideoStatusResponse:
    """Return current status: pending, completed, or failed."""
    try:
        status = service.get_status(job_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return VideoStatusResponse(job_id=job_id, status=status)


@router.get(
    "/jobs/{job_id}/download",
    response_class=Response,
    responses={200: {"content": {"video/mp4": {}}}},
    summary="Download completed video",
)
async def download_video(
    job_id: str,
    service: VideoService = Depends(_video_service),
) -> Response:
    """Download the video file when status is completed. Returns 400 if not ready or failed."""
    try:
        data = service.download(job_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return Response(content=data, media_type="video/mp4")


@router.post(
    "/remix",
    response_model=VideoJobResponse,
    summary="Remix existing video",
)
async def remix_video(
    body: RemixVideoRequest,
    service: VideoService = Depends(_video_service),
) -> VideoJobResponse:
    """
    Start a remix job from an existing video (job_id). Returns new job_id;
    poll status and download the same way as for generate.
    """
    try:
        job_id = service.remix(body.video_id, body.prompt)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return VideoJobResponse(job_id=job_id)
