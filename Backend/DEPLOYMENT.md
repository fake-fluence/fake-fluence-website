# Deploying the Backend (Render & Railway)

This guide covers deploying the FastAPI backend to **Render** or **Railway** using their **free tiers**, with minimal configuration.

---

## Prerequisites

- Git repo with the `Backend/` app (this folder)
- An **OpenAI API key** (set as `OPENAI_API_KEY` or `API_KEY` in the deployment environment)
- A Render or Railway account

---

## Option 1: Render (Free Tier)

### 1. Create a Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com) and sign in.
2. Click **New** → **Web Service**.
3. Connect your Git repository and select the repo that contains this backend.
4. Configure the service:
   - **Name:** e.g. `influencer-ai-studio-api`
   - **Region:** choose the closest to your users
   - **Root Directory:** leave empty if the repo root is the project root, or set to the folder that **contains** the `Backend` folder (e.g. if your repo root is the monorepo root, set **Root Directory** to empty and build/start from `Backend` — see below)
   - **Environment:** `Python 3`
   - **Build Command:**  
     If Render’s root is the **repo root** (e.g. `influencer-ai-studio`), set:
     ```bash
     cd Backend && pip install -r requirements.txt
     ```
     If you deploy from a repo that has **only** the backend, use:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**  
     If repo root is the monorepo:
     ```bash
     cd Backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
     If repo root is the Backend folder:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
     Render sets `PORT` automatically (often `10000` on free tier).

### 2. Environment Variables

In the Render service → **Environment** tab, add:

| Key             | Value              | Secret |
|-----------------|--------------------|--------|
| `OPENAI_API_KEY` or `API_KEY` | Your OpenAI API key | Yes   |

No `.env` file is needed in the repo; use Render’s env vars only.

### 3. Free Tier Notes (Render)

- **Spins down** after ~15 minutes of no traffic; first request after that may take 30–60 seconds (cold start).
- **Request timeout** is often **30 seconds** on free tier. Image generation usually fits; long video jobs are better handled **asynchronously** (start job → poll status → download when ready).
- **Memory:** 512 MB. Enough for this FastAPI app; avoid loading huge files in memory.

### 4. Optional: Root Directory = `Backend`

If your repo root is the full project (e.g. `influencer-ai-studio`) and you want Render to treat `Backend` as the app root:

- Set **Root Directory** to `Backend`.
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Then all commands run from `Backend/` and `$PORT` is set by Render.

---

## Option 2: Railway (Free Tier)

### 1. Create a New Project

1. Go to [railway.app](https://railway.app) and sign in.
2. **New Project** → **Deploy from GitHub repo** (or CLI) and select your repository.
3. Railway will try to detect the stack. If it picks something other than Python, add a **Nixpacks** or **Dockerfile** config, or set the correct **Root** (see below).

### 2. Configure Build & Start

- **Root Directory:** If the backend lives in `Backend/`, set the service **Root** to `Backend` in the service settings (or deploy from a repo that has only the backend).
- **Build:** Railway often auto-detects `requirements.txt`. If not, set build command to:
  ```bash
  pip install -r requirements.txt
  ```
- **Start:** Set the start command to:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
  Railway sets `PORT` (often `8080` or the one they assign).

### 3. Environment Variables

In the Railway project → your service → **Variables**:

| Variable          | Value              |
|-------------------|--------------------|
| `OPENAI_API_KEY` or `API_KEY` | Your OpenAI API key |

Mark as **sensitive** if the UI allows.

### 4. Free Tier Notes (Railway)

- **Free tier** has a monthly usage cap; check current limits on Railway’s pricing page.
- **Request timeout:** Avoid very long synchronous work; use the async video flow (create job → poll → download).
- Use **Healthcheck** in Railway if available: path `/health`, interval ~30s, so the platform knows the app is up.

---

## Health & Docs Endpoints

After deployment, you can use:

- **Root:** `GET /` — short service info and link to docs.
- **Health:** `GET /health` — returns `{"status": "ok"}` for load balancers and monitoring.
- **API docs:** `GET /docs` (Swagger UI).
- **ReDoc:** `GET /redoc`.

Base URL will be something like:

- Render: `https://<your-service-name>.onrender.com`
- Railway: `https://<your-app>.up.railway.app` (or the URL Railway assigns)

---

## Checklist Before First Deploy

- [ ] `OPENAI_API_KEY` or `API_KEY` set in the platform’s environment (not committed).
- [ ] Build runs from the directory that contains `requirements.txt` and `app/`.
- [ ] Start command uses `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- [ ] No `.env` with secrets in the repo (use platform env vars only for production).

---

## Optional: `Dockerfile` for Consistent Builds

If you prefer Docker (works on both Render and Railway):

```dockerfile
# Backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

- **Render:** use “Docker” as environment and point to this Dockerfile (with context `Backend` if needed).
- **Railway:** set root to `Backend` and Railway will use the Dockerfile if present.

Use `PORT` in CMD if the platform injects it, e.g.:

```dockerfile
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
```

(or pass `$PORT` in the start command in the dashboard instead).

---

Once deployed, point your frontend (or Postman) at the service base URL and use `/api/images/` and `/api/videos/` as described in the API docs at `/docs`.
