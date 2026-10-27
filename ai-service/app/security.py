import hmac
import os

from fastapi import Header, HTTPException


def require_service_token(x_ai_service_token: str | None = Header(default=None)) -> None:
    """Reject calls that do not carry the shared secret configured on the backend.

    When AI_SERVICE_TOKEN is unset (local development / tests) the service stays open.
    """
    expected = os.getenv("AI_SERVICE_TOKEN", "")
    if not expected:
        return
    if not x_ai_service_token or not hmac.compare_digest(x_ai_service_token, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
