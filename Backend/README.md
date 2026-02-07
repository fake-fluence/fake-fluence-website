# Influencer AI Studio — Backend

FastAPI backend for **image and video generation/editing** (OpenAI). Use the REST API or the CLI script.

**Setup:** `pip install -r requirements.txt` (or `uv sync`). Put your OpenAI API key in a `.env` file at the **repo root** (copy `.env.example` to `.env` and add `API_KEY=...` or `OPENAI_API_KEY=...`). Do not commit `.env` (it’s in `.gitignore`).

---

## Running the API

From the `Backend/` directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Docs:** http://localhost:8000/docs  
- **Health:** http://localhost:8000/health  
- **API base:** `/api` (e.g. `POST /api/images/generate`, `POST /api/videos/generate`)

See **DEPLOYMENT.md** for deploying on Render or Railway (free tiers).

---

## CLI: OpenAI Image & Video Script (`openai_media.py`)

---

### What’s supported

| Task | Command | APIs used |
|------|--------|-----------|
| **Generate image** from text | `generate-image` | Images: `dall-e-2`, `dall-e-3`, `gpt-image-1*` |
| **Edit image(s)** (e.g. replace object in image 1 with object from image 2) | `edit-image` | Images Edit (multi-image with `gpt-image-1.5`) |
| **Generate video** from text (optional image reference) | `generate-video` | Videos: `sora-2`, `sora-2-pro` |
| **Remix / edit video** (new prompt on existing video) | `remix-video` | Videos Remix |

**Default models:** `generate-image` and `edit-image` use **gpt-image-1.5**; `generate-video` uses **sora-2**. Override with `--model` (e.g. `-m dall-e-3` for images, `-m sora-2-pro` for video).

---

### How to use everything

#### 1. Generate an image from a prompt

Creates a new image from a text description. Choose model, size, and optionally quality/style.

```bash
python openai_media.py generate-image --prompt "A sunset over mountains" --output sun.png
```

**Options:** `--model` (dall-e-2, dall-e-3, gpt-image-1.5, etc.), `--size`, `--quality`, `--n` (number of images; DALL-E 3 only supports 1). Use `-p` / `-o` as short flags.

**Example with options:**
```bash
python openai_media.py generate-image -p "A cute baby sea otter" -m gpt-image-1.5 --size 1024x1024 -o otter.png
```

---

#### 2. Edit image(s) with a prompt (including two images: replace product in image 1 with item from image 2)

Takes one or more input images and a text instruction. The model (default `gpt-image-1.5`) can use **multiple images** in one request—e.g. “use the object in image 2 to replace the object in image 1.”

**Example: Replace the product the person is holding in image 1 with the item in image 2**

- **Image 1:** Photo of a person holding product A (e.g. a bottle).
- **Image 2:** Photo of product B (e.g. a different bottle or box).
- **Prompt:** Instruct the model to put the item from image 2 into the person’s hand in image 1.

```bash
python openai_media.py edit-image \
  --images person_holding_bottle.png new_product.png \
  --prompt "Replace the product the person is holding in the first image with the product shown in the second image. Keep the same pose, lighting and background. The result should look like the person is now holding the item from the second image." \
  --output result.png
```

Short form:

```bash
python openai_media.py edit-image -i person_holding_bottle.png new_product.png \
  -p "Replace the product the person is holding in the first image with the product shown in the second image." \
  -o result.png
```

**Options:** `--images` / `-i` (one or more image paths, in order), `--prompt` / `-p`, `--output` / `-o`, `--model` (use a gpt-image model for multi-image edits).

---

#### 3. Generate a video from a prompt

Creates a short video from a text prompt (and optionally an image reference). The script starts a job, polls until it’s done, then saves the MP4.

```bash
python openai_media.py generate-video --prompt "A calico cat playing piano on stage" --output cat.mp4
```

**Options:** `--model` (sora-2, sora-2-pro), `--seconds` (4, 8, or 12), `--size` (e.g. 720x1280, 1280x720), `--input-reference` / `-r` (image file to guide the video). Use `--no-wait` to only create the job and print the video ID (you can download later via the API).

**Example with image reference:**
```bash
python openai_media.py generate-video -p "Animate this product with a subtle rotation" -r product_photo.png -o ad.mp4
```

---

#### 4. Remix (edit) a video with a new prompt

Takes an existing video job ID and a new prompt to generate a remixed video (e.g. extend or change the scene). Same flow: create job, poll until done, save MP4.

```bash
python openai_media.py remix-video --video-id video_xxxxx --prompt "Extend the scene with the cat taking a bow to the audience" --output remix.mp4
```

**Options:** `--video-id` / `-v` (required; from a previous `generate-video` or `remix-video`), `--prompt` / `-p`, `--output` / `-o`. Use `--no-wait` to skip waiting and only get the new job ID.

---

### Quick reference

| Goal | Command |
|------|--------|
| Image from text | `python openai_media.py generate-image -p "..." -o out.png` |
| Replace product in image 1 with item from image 2 | `python openai_media.py edit-image -i image1.png image2.png -p "Replace the product the person is holding in the first image with the product shown in the second image." -o result.png` |
| Video from text | `python openai_media.py generate-video -p "..." -o out.mp4` |
| Remix video | `python openai_media.py remix-video -v VIDEO_ID -p "..." -o remix.mp4` |

For all options: `python openai_media.py --help` and `python openai_media.py <command> --help`.


```
uv run openai_media.py edit-image --images tmp/woman-holding-water-bottle_328191-4602.jpg.png "tmp/WhatsApp Image 2026-02-07 at 21.33.39.jpeg" --prompt "Replace the product the person is holding in the first image with the product shown in the second image." --output tmp/result.png

```