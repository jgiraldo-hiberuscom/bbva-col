from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT_DIR / ".env"


@dataclass(frozen=True)
class Settings:
    litellm_base_url: str
    litellm_api_key: str
    litellm_model: str
    allowed_http_hosts: tuple[str, ...]
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    cors_allowed_origins: tuple[str, ...] = ("http://127.0.0.1:4173",)
    http_timeout_seconds: float = 10.0
    http_max_response_chars: int = 3000


def load_settings() -> Settings:
    load_dotenv(ENV_FILE)

    litellm_base_url = _require_any_env(
        "COPILOT_PROVIDER_BASE_URL",
        "LITELLM_BASE_URL",
    )
    litellm_api_key = _require_any_env(
        "COPILOT_PROVIDER_API_KEY",
        "LITELLM_API_KEY",
    )
    litellm_model = _require_any_env(
        "COPILOT_MODEL",
        "LITELLM_MODEL",
    )

    allowed_http_hosts = tuple(_parse_csv_env("ALLOWED_HTTP_HOSTS"))
    if not allowed_http_hosts:
        raise ValueError(
            "ALLOWED_HTTP_HOSTS debe contener al menos un host permitido."
        )

    api_host = os.getenv("AGENT_API_HOST", "127.0.0.1").strip() or "127.0.0.1"
    api_port = int(os.getenv("AGENT_API_PORT", "8000"))
    if api_port <= 0:
        raise ValueError("AGENT_API_PORT debe ser mayor que 0.")

    cors_allowed_origins = tuple(
        _parse_csv_env(
            "AGENT_API_CORS_ALLOWED_ORIGINS",
            default="http://127.0.0.1:4173,http://localhost:4173",
        )
    )
    if not cors_allowed_origins:
        raise ValueError(
            "AGENT_API_CORS_ALLOWED_ORIGINS debe contener al menos un origen."
        )

    http_timeout_seconds = float(os.getenv("HTTP_TIMEOUT_SECONDS", "10"))
    if http_timeout_seconds <= 0:
        raise ValueError("HTTP_TIMEOUT_SECONDS debe ser mayor que 0.")

    http_max_response_chars = int(os.getenv("HTTP_MAX_RESPONSE_CHARS", "3000"))
    if http_max_response_chars <= 0:
        raise ValueError("HTTP_MAX_RESPONSE_CHARS debe ser mayor que 0.")

    return Settings(
        litellm_base_url=litellm_base_url.rstrip("/"),
        litellm_api_key=litellm_api_key,
        litellm_model=litellm_model,
        allowed_http_hosts=allowed_http_hosts,
        api_host=api_host,
        api_port=api_port,
        cors_allowed_origins=cors_allowed_origins,
        http_timeout_seconds=http_timeout_seconds,
        http_max_response_chars=http_max_response_chars,
    )


def _require_any_env(*names: str) -> str:
    for name in names:
        value = os.getenv(name, "").strip()
        if value:
            return value

    names_list = ", ".join(names)
    raise ValueError(
        "Falta una variable de entorno requerida. Usa una de estas: "
        f"{names_list}"
    )


def _parse_csv_env(name: str, default: str = "") -> list[str]:
    raw_value = os.getenv(name, default)
    return [item.strip().lower() for item in raw_value.split(",") if item.strip()]