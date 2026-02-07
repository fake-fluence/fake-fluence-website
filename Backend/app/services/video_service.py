"""Video generation and remix via OpenAI API."""

import time
from typing import BinaryIO

from openai import OpenAI


VIDEO_MODELS = ["sora-2", "sora-2-pro"]
VIDEO_SECONDS = ["4", "8", "12"]
VIDEO_SIZES = ["720x1280", "1280x720", "1024x1792", "1792x1024"]


class VideoService:
    """Generate and remix videos using OpenAI Sora."""

    def __init__(self, client: OpenAI) -> None:
        self._client = client

    def create(
        self,
        prompt: str,
        *,
        model: str = "sora-2",
        seconds: str = "4",
        size: str = "720x1280",
        input_reference: BinaryIO | None = None,
    ) -> str:
        """
        Start a video generation job. Returns job id.
        Poll status with get_status; download with download_content when completed.
        """
        kwargs: dict = {
            "prompt": prompt,
            "model": model,
            "seconds": seconds,
            "size": size,
        }
        if input_reference is not None:
            kwargs["input_reference"] = input_reference
        job = self._client.videos.create(**kwargs)
        return job.id

    def get_status(self, video_id: str) -> str:
        """Return job status: e.g. pending, completed, failed."""
        job = self._client.videos.retrieve(video_id)
        return getattr(job, "status", "unknown")

    def download(self, video_id: str) -> bytes:
        """Download completed video content. Raises if not completed or failed."""
        status = self.get_status(video_id)
        if status == "failed":
            job = self._client.videos.retrieve(video_id)
            err = getattr(job, "error", None)
            raise RuntimeError(f"Video job failed: {err}")
        if status != "completed":
            raise ValueError(f"Video not ready (status={status}). Poll until completed.")
        resp = self._client.videos.download_content(video_id)
        return resp.read()

    def wait_until_done(
        self,
        video_id: str,
        poll_interval_seconds: int = 10,
        timeout_seconds: int | None = None,
    ) -> str:
        """
        Poll until status is completed or failed. Returns final status.
        Raises RuntimeError on failure; timeout_seconds=None means no timeout.
        """
        start = time.monotonic()
        while True:
            status = self.get_status(video_id)
            if status in ("completed", "failed"):
                return status
            if timeout_seconds is not None and (time.monotonic() - start) >= timeout_seconds:
                raise TimeoutError(f"Video job {video_id} did not complete within {timeout_seconds}s")
            time.sleep(poll_interval_seconds)

    def remix(self, video_id: str, prompt: str) -> str:
        """Start a remix job from an existing video. Returns new job id."""
        job = self._client.videos.remix(video_id, prompt=prompt)
        return job.id
