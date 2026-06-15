from __future__ import annotations

from typing import Annotated
from urllib.parse import urlparse

import requests
from pydantic import Field

from config import Settings


def create_http_request_tool(settings: Settings):
    def hacer_http_request(
        url: Annotated[
            str,
            Field(
                description=(
                    "URL completa permitida por allowlist para hacer una peticion "
                    "HTTP GET."
                )
            ),
        ]
    ) -> str:
        """Realiza una peticion HTTP GET a una URL permitida por allowlist."""
        return _perform_http_get(url=url, settings=settings)

    return hacer_http_request


def _perform_http_get(url: str, settings: Settings) -> str:
    parsed_url = urlparse(url)
    hostname = (parsed_url.hostname or "").lower()
    scheme = (parsed_url.scheme or "").lower()

    if scheme not in {"http", "https"}:
        return "Error: solo se permiten URLs con esquema http o https."

    if not hostname:
        return "Error: la URL debe incluir un host valido."

    if parsed_url.username or parsed_url.password:
        return "Error: no se permiten credenciales embebidas en la URL."

    if not _host_is_allowed(hostname, settings.allowed_http_hosts):
        return (
            f"Error: el host '{hostname}' no esta permitido por la allowlist actual."
        )

    try:
        response = requests.get(url, timeout=settings.http_timeout_seconds)
        response.raise_for_status()
    except requests.Timeout:
        return (
            "Error: la peticion HTTP excedio el timeout de "
            f"{settings.http_timeout_seconds} segundos."
        )
    except requests.RequestException as exc:
        return f"Error realizando la peticion HTTP: {exc}"

    content_type = response.headers.get("content-type", "desconocido")
    body = response.text.strip()
    if not body:
        body = "<respuesta vacia>"

    if len(body) > settings.http_max_response_chars:
        body = (
            body[: settings.http_max_response_chars]
            + "\n\n[respuesta truncada por limite de seguridad]"
        )

    return (
        f"HTTP {response.status_code}\n"
        f"Content-Type: {content_type}\n\n"
        f"{body}"
    )


def _host_is_allowed(hostname: str, allowed_hosts: tuple[str, ...]) -> bool:
    for allowed_host in allowed_hosts:
        if hostname == allowed_host or hostname.endswith(f".{allowed_host}"):
            return True
    return False