from fastapi.testclient import TestClient

from app.routers import ai_router
from main import app

client = TestClient(app)


def test_rejects_oversized_answer():
    response = client.post(
        "/ai/evaluate-answer", json={"question": "q", "answer": "x" * 20001})
    assert response.status_code == 422


def test_internal_error_is_not_leaked(monkeypatch):
    async def boom(*args, **kwargs):
        raise RuntimeError("provider key sk-do-not-leak")

    monkeypatch.setattr(ai_router.evaluation_service, "evaluate", boom)
    response = client.post(
        "/ai/evaluate-answer", json={"question": "q", "answer": "a reasonable answer"})

    assert response.status_code == 500
    assert response.json()["detail"] == "AI service error"
    assert "sk-do-not-leak" not in response.text


def test_shared_secret_is_required_when_configured(monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "s3cret")
    body = {"question": "q", "answer": "a reasonable answer"}

    assert client.post("/ai/evaluate-answer", json=body).status_code == 401
    assert client.post(
        "/ai/evaluate-answer", json=body,
        headers={"X-AI-Service-Token": "wrong"}).status_code == 401
    # The correct secret reaches the handler (which then evaluates).
    assert client.post(
        "/ai/evaluate-answer", json=body,
        headers={"X-AI-Service-Token": "s3cret"}).status_code == 200
