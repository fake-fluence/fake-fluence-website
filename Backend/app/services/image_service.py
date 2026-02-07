"""Image generation and editing via OpenAI API."""

import base64
import io
from typing import BinaryIO

from openai import OpenAI


# Supported models and options (aligned with OpenAI API)
IMAGE_MODELS = ["dall-e-2", "dall-e-3", "gpt-image-1", "gpt-image-1-mini", "gpt-image-1.5"]
IMAGE_SIZES = {
    "dall-e-2": ["256x256", "512x512", "1024x1024"],
    "dall-e-3": ["1024x1024", "1792x1024", "1024x1792"],
    "gpt-image": ["1024x1024", "1536x1024", "1024x1536", "auto"],
}


def _read_image_bytes(item) -> bytes:
    """Extract raw bytes from a single ImagesResponse data item."""
    if getattr(item, "b64_json", None):
        return base64.b64decode(item.b64_json)
    if getattr(item, "url", None):
        import urllib.request
        return urllib.request.urlopen(item.url).read()
    raise ValueError(f"Unexpected response format: {item}")


class ImageService:
    """Generate and edit images using OpenAI models."""

    def __init__(self, client: OpenAI) -> None:
        self._client = client

    def generate(
        self,
        prompt: str,
        *,
        model: str = "gpt-image-1.5",
        size: str | None = None,
        quality: str | None = None,
        n: int = 1,
        style: str | None = None,
    ) -> bytes:
        """
        Generate image(s) from a text prompt. Returns the first image as PNG bytes.
        For n>1 the API returns multiple; we return the first only for the API response.
        """
        if model == "dall-e-3":
            n = 1
        size = size or ("auto" if model.startswith("gpt-image") else "1024x1024")
        kwargs: dict = {
            "model": model,
            "prompt": prompt,
            "n": n,
            "size": size,
        }
        if quality:
            kwargs["quality"] = quality
        if model == "dall-e-3" and style:
            kwargs["style"] = style
        kwargs["response_format"] = "b64_json"

        resp = self._client.images.generate(**kwargs)
        if not resp.data:
            raise ValueError("No image data in response")
        return _read_image_bytes(resp.data[0])

    def generate_all(
        self,
        prompt: str,
        *,
        model: str = "gpt-image-1.5",
        size: str | None = None,
        quality: str | None = None,
        n: int = 1,
        style: str | None = None,
    ) -> list[bytes]:
        """Generate up to n images; returns list of PNG bytes (DALL-E 3 only supports n=1)."""
        if model == "dall-e-3":
            n = 1
        size = size or ("auto" if model.startswith("gpt-image") else "1024x1024")
        kwargs: dict = {
            "model": model,
            "prompt": prompt,
            "n": n,
            "size": size,
            "response_format": "b64_json",
        }
        if quality:
            kwargs["quality"] = quality
        if model == "dall-e-3" and style:
            kwargs["style"] = style

        resp = self._client.images.generate(**kwargs)
        return [_read_image_bytes(item) for item in resp.data]

    def edit(
        self,
        prompt: str,
        image_files: list[BinaryIO],
        *,
        model: str = "gpt-image-1.5",
    ) -> bytes:
        """
        Edit image(s) with a prompt (e.g. replace object in image 1 with object from image 2).
        image_files: ordered list of image file-like objects (read binary).
        """
        if not image_files:
            raise ValueError("At least one image is required")
        resp = self._client.images.edit(
            model=model,
            image=image_files,
            prompt=prompt,
        )
        if not resp.data:
            raise ValueError("No image data in response")
        return _read_image_bytes(resp.data[0])
