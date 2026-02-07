"""FastAPI dependency injection."""

from openai import OpenAI

from app.config import Settings, get_settings


def get_openai_client(settings: Settings | None = None) -> OpenAI:
    """Return OpenAI client; uses settings from env/.env if not provided."""
    if settings is None:
        settings = get_settings()
    key = settings.effective_openai_key
    if not key:
        raise ValueError(
            "Set OPENAI_API_KEY or API_KEY in the environment or in a .env file at the repo root."
        )
    return OpenAI(api_key=key)
