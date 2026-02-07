#!/usr/bin/env python3
"""
OpenAI Image & Video generation/editing script.

Supports:
- Generate images from a prompt (DALL-E 2/3, GPT Image models).
- Edit images: one or more input images + prompt (e.g. replace object in image 1 with object from image 2).
- Generate videos from a prompt (Sora 2), with optional image reference; polls until done and saves.
- Remix an existing video with a new prompt.

Requires an API key: set OPENAI_API_KEY or API_KEY in the environment, or put API_KEY=... in a .env file at the repo root (or in this directory).
"""

import argparse
import base64
import os
import sys
import time
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("Install the OpenAI client: pip install openai", file=sys.stderr)
    sys.exit(1)


def _load_dotenv() -> None:
    """Load .env from repo root, then script directory, then cwd into os.environ."""
    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent  # Backend/ -> repo root
    for base in (repo_root, script_dir, Path.cwd()):
        env_file = base / ".env"
        if env_file.is_file():
            with open(env_file) as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        key, _, value = line.partition("=")
                        key, value = key.strip(), value.strip()
                        if value and (value.startswith('"') and value.endswith('"') or value.startswith("'") and value.endswith("'")):
                            value = value[1:-1]
                        if key and key not in os.environ:
                            os.environ[key] = value
            break


# --- Image models and options (from API docs) ---
IMAGE_MODELS = ["dall-e-2", "dall-e-3", "gpt-image-1", "gpt-image-1-mini", "gpt-image-1.5"]
IMAGE_SIZES = {
    "dall-e-2": ["256x256", "512x512", "1024x1024"],
    "dall-e-3": ["1024x1024", "1792x1024", "1024x1792"],
    "gpt-image": ["1024x1024", "1536x1024", "1024x1536", "auto"],
}
VIDEO_MODELS = ["sora-2", "sora-2-pro"]
VIDEO_SECONDS = ["4", "8", "12"]
VIDEO_SIZES = ["720x1280", "1280x720", "1024x1792", "1792x1024"]


def get_client():
    key = os.environ.get("OPENAI_API_KEY") or os.environ.get("API_KEY")
    if not key:
        print("Set OPENAI_API_KEY or API_KEY in your environment or in a .env file.", file=sys.stderr)
        sys.exit(1)
    return OpenAI(api_key=key)


def cmd_generate_image(client: OpenAI, args: argparse.Namespace) -> None:
    """Generate image(s) from a text prompt."""
    model = args.model or "gpt-image-1.5"
    size = args.size or ("auto" if model.startswith("gpt-image") else "1024x1024")
    quality = getattr(args, "quality", None)
    n = getattr(args, "n", 1)
    if model == "dall-e-3":
        n = 1  # API only allows 1 for DALL-E 3

    kwargs = {
        "model": model,
        "prompt": args.prompt,
        "n": n,
        "size": size,
    }
    if quality:
        kwargs["quality"] = quality
    if model == "dall-e-3" and getattr(args, "style", None):
        kwargs["style"] = args.style  # vivid | natural
    if model.startswith("gpt-image") and getattr(args, "output_format", None):
        kwargs["response_format"] = None  # GPT image models return b64 by default
    # DALL-E 2/3 can return url or b64_json
    if model in ("dall-e-2", "dall-e-3") and args.output:
        kwargs["response_format"] = "b64_json"

    resp = client.images.generate(**kwargs)
    out_path = Path(args.output or "output_image.png")
    out_path.parent.mkdir(parents=True, exist_ok=True)

    for i, item in enumerate(resp.data):
        if getattr(item, "b64_json", None):
            data = base64.b64decode(item.b64_json)
        elif getattr(item, "url", None):
            import urllib.request
            data = urllib.request.urlopen(item.url).read()
        else:
            print("Unexpected response format", item, file=sys.stderr)
            continue
        if len(resp.data) == 1:
            path = out_path
        else:
            path = out_path.parent / f"{out_path.stem}_{i}{out_path.suffix}"
        with open(path, "wb") as f:
            f.write(data)
        print(f"Saved: {path}")


def cmd_edit_image(client: OpenAI, args: argparse.Namespace) -> None:
    """Edit image(s) with a prompt. Supports multiple images (e.g. replace object in image 1 with object from image 2)."""
    images = getattr(args, "images", None) or [args.image]
    if not images:
        print("Provide at least one image (--image or --images).", file=sys.stderr)
        sys.exit(1)

    model = getattr(args, "model", None) or "gpt-image-1.5"
    # GPT image models support up to 16 images; DALL-E edit is single image + optional mask
    files = []
    for p in images:
        path = Path(p)
        if not path.exists():
            print(f"File not found: {path}", file=sys.stderr)
            sys.exit(1)
        files.append(open(path, "rb"))

    try:
        resp = client.images.edit(
            model=model,
            image=files,
            prompt=args.prompt,
        )
    finally:
        for f in files:
            f.close()

    out_path = Path(args.output or "output_edit.png")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    item = resp.data[0]
    if getattr(item, "b64_json", None):
        data = base64.b64decode(item.b64_json)
    elif getattr(item, "url", None):
        import urllib.request
        data = urllib.request.urlopen(item.url).read()
    else:
        print("Unexpected response format", item, file=sys.stderr)
        sys.exit(1)
    with open(out_path, "wb") as f:
        f.write(data)
    print(f"Saved: {out_path}")


def _poll_video_until_done(client: OpenAI, video_id: str, poll_interval: int = 10) -> None:
    while True:
        job = client.videos.retrieve(video_id)
        status = getattr(job, "status", None) or getattr(job, "status", "unknown")
        print(f"  Video status: {status}")
        if status == "completed":
            return
        if status == "failed":
            err = getattr(job, "error", None)
            raise RuntimeError(f"Video job failed: {err}")
        time.sleep(poll_interval)


def cmd_generate_video(client: OpenAI, args: argparse.Namespace) -> None:
    """Generate video from prompt; optional image reference. Polls until complete and saves."""
    kwargs = {
        "prompt": args.prompt,
        "model": getattr(args, "model", None) or "sora-2",
        "seconds": getattr(args, "seconds", None) or "4",
        "size": getattr(args, "size", None) or "720x1280",
    }
    if getattr(args, "input_reference", None):
        kwargs["input_reference"] = open(args.input_reference, "rb")

    try:
        job = client.videos.create(**kwargs)
    finally:
        if kwargs.get("input_reference"):
            kwargs["input_reference"].close()

    video_id = job.id
    print(f"Video job created: {video_id}")

    if not args.no_wait:
        _poll_video_until_done(client, video_id, poll_interval=getattr(args, "poll_interval", 10))
        out_path = Path(args.output or "output_video.mp4")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        resp = client.videos.download_content(video_id)
        content = resp.read()
        with open(out_path, "wb") as f:
            f.write(content)
        print(f"Saved: {out_path}")
    else:
        print("Skipping wait. To download later: use remix or call videos.download_content with this id.")


def cmd_remix_video(client: OpenAI, args: argparse.Namespace) -> None:
    """Remix an existing video with a new prompt. Polls until complete and saves."""
    video_id = args.video_id
    job = client.videos.remix(video_id, prompt=args.prompt)
    new_id = job.id
    print(f"Remix job created: {new_id}")

    if not args.no_wait:
        _poll_video_until_done(client, new_id, poll_interval=getattr(args, "poll_interval", 10))
        out_path = Path(args.output or "output_remix.mp4")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        resp = client.videos.download_content(new_id)
        content = resp.read()
        with open(out_path, "wb") as f:
            f.write(content)
        print(f"Saved: {out_path}")


def main():
    _load_dotenv()
    parser = argparse.ArgumentParser(
        description="OpenAI image and video generation/editing. Uses OPENAI_API_KEY or API_KEY from env/.env.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate image from prompt
  python openai_media.py generate-image --prompt "A sunset over mountains" --output sun.png

  # Edit: replace object in first image with object from second image
  python openai_media.py edit-image --images person_holding_product.png new_product.png --prompt "Replace the product the person is holding in the first image with the product shown in the second image" --output result.png

  # Generate video (polls until done, then saves)
  python openai_media.py generate-video --prompt "A calico cat playing piano on stage" --output cat.mp4

  # Remix a video
  python openai_media.py remix-video --video-id video_xxx --prompt "Extend with the cat taking a bow" --output remix.mp4
"""
    )
    parser.add_argument("--api-key", default=os.environ.get("OPENAI_API_KEY") or os.environ.get("API_KEY"), help="OpenAI API key (or set OPENAI_API_KEY / API_KEY, or use .env)")
    sub = parser.add_subparsers(dest="command", required=True)

    # --- generate-image ---
    p_gen = sub.add_parser("generate-image", help="Generate image(s) from a text prompt")
    p_gen.add_argument("--prompt", "-p", required=True, help="Text description of the image")
    p_gen.add_argument("--model", "-m", choices=IMAGE_MODELS, default="gpt-image-1.5", help="Model (default: gpt-image-1.5)")
    p_gen.add_argument("--size", "-s", help="Size (e.g. 1024x1024; for gpt-image use 1024x1024, 1536x1024, 1024x1536, auto)")
    p_gen.add_argument("--quality", "-q", help="Quality: for DALL-E 3 use 'hd' or 'standard'; for gpt-image use 'high','medium','low'")
    p_gen.add_argument("--n", type=int, default=1, help="Number of images (dall-e-3 only supports 1)")
    p_gen.add_argument("--style", choices=["vivid", "natural"], help="DALL-E 3 only: vivid or natural")
    p_gen.add_argument("--output", "-o", help="Output path (default: output_image.png)")

    # --- edit-image ---
    p_edit = sub.add_parser("edit-image", help="Edit image(s) with a prompt; supports multiple images (e.g. replace object in img1 with object from img2)")
    p_edit.add_argument("--images", "-i", nargs="+", help="Input image paths (e.g. scene.png product.png)")
    p_edit.add_argument("--image", help="Single input image (alternative to --images)")
    p_edit.add_argument("--prompt", "-p", required=True, help="Edit instruction (e.g. 'Replace the object in the first image with the product from the second image')")
    p_edit.add_argument("--model", "-m", choices=IMAGE_MODELS, default="gpt-image-1.5", help="Model (default: gpt-image-1.5; multi-image needs gpt-image)")
    p_edit.add_argument("--output", "-o", help="Output path (default: output_edit.png)")

    # --- generate-video ---
    p_vid = sub.add_parser("generate-video", help="Generate video from prompt (Sora); polls until done and saves")
    p_vid.add_argument("--prompt", "-p", required=True, help="Text description of the video")
    p_vid.add_argument("--model", choices=VIDEO_MODELS, default="sora-2")
    p_vid.add_argument("--seconds", choices=VIDEO_SECONDS, default="4", help="Duration in seconds")
    p_vid.add_argument("--size", choices=VIDEO_SIZES, default="720x1280", help="Resolution")
    p_vid.add_argument("--input-reference", "-r", help="Optional image file to guide generation")
    p_vid.add_argument("--output", "-o", help="Output path (default: output_video.mp4)")
    p_vid.add_argument("--no-wait", action="store_true", help="Do not wait for completion; only print job id")
    p_vid.add_argument("--poll-interval", type=int, default=10, help="Seconds between status polls (default: 10)")

    # --- remix-video ---
    p_remix = sub.add_parser("remix-video", help="Remix an existing video with a new prompt")
    p_remix.add_argument("--video-id", "-v", required=True, help="Video job ID from a previous create")
    p_remix.add_argument("--prompt", "-p", required=True, help="New prompt for the remix")
    p_remix.add_argument("--output", "-o", help="Output path (default: output_remix.mp4)")
    p_remix.add_argument("--no-wait", action="store_true", help="Do not wait for completion")
    p_remix.add_argument("--poll-interval", type=int, default=10, help="Seconds between status polls")

    args = parser.parse_args()
    if args.api_key:
        os.environ["OPENAI_API_KEY"] = args.api_key
    client = get_client()

    if args.command == "generate-image":
        cmd_generate_image(client, args)
    elif args.command == "edit-image":
        cmd_edit_image(client, args)
    elif args.command == "generate-video":
        cmd_generate_video(client, args)
    elif args.command == "remix-video":
        cmd_remix_video(client, args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
