"""Application configuration and env loading."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _load_dotenv_into_environ() -> None:
    """Load .env from repo root, then Backend dir, then cwd. Idempotent for os.environ."""
    import os

    backend_dir = Path(__file__).resolve().parent.parent
    repo_root = backend_dir.parent
    for base in (repo_root, backend_dir, Path.cwd()):
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
                        if value and (
                            (value.startswith('"') and value.endswith('"'))
                            or (value.startswith("'") and value.endswith("'"))
                        ):
                            value = value[1:-1]
                        if key and key not in os.environ:
                            os.environ[key] = value
            return


class Settings(BaseSettings):
    """App settings from environment / .env (loaded before validation)."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str = ""
    api_key: str = ""

    @property
    def effective_openai_key(self) -> str:
        """OpenAI key from OPENAI_API_KEY or API_KEY."""
        return self.openai_api_key or self.api_key or ""


def get_settings() -> Settings:
    """Load env files then return settings. Call once at startup."""
    _load_dotenv_into_environ()
    return Settings()
