import asyncio
import json

import httpx

from app.services import cache as cache_module


def test_key_is_deterministic():
    first = cache_module.Cache.key("rubric", "question", "answer", "expected", "gemini")
    second = cache_module.Cache.key("rubric", "question", "answer", "expected", "gemini")
    different = cache_module.Cache.key("rubric", "question", "other answer", "expected", "gemini")

    assert first == second
    assert first != different
    assert first.startswith("ai-interviewer:rubric:")


def test_memory_cache_expires(monkeypatch):
    monkeypatch.delenv("UPSTASH_REDIS_REST_URL", raising=False)
    monkeypatch.delenv("UPSTASH_REDIS_REST_TOKEN", raising=False)
    monkeypatch.setenv("CACHE_ENABLED", "true")

    clock = [1000.0]
    monkeypatch.setattr(cache_module.time, "monotonic", lambda: clock[0])
    cache = cache_module.Cache()

    async def scenario():
        assert cache.backend == "memory"
        await cache.set("key", {"score": 91}, ttl=10)
        assert await cache.get("key") == {"score": 91}
        clock[0] += 11
        assert await cache.get("key") is None
        await cache.close()

    asyncio.run(scenario())


def test_upstash_round_trip_and_command_shape(monkeypatch):
    monkeypatch.setenv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io")
    monkeypatch.setenv("UPSTASH_REDIS_REST_TOKEN", "secret-token")
    monkeypatch.setenv("CACHE_ENABLED", "true")

    calls = []

    def handler(request: httpx.Request):
        payload = json.loads(request.content)
        calls.append({"auth": request.headers.get("authorization"), "payload": payload})
        if payload[0] == "GET":
            return httpx.Response(200, json={"result": json.dumps({"score": 88})})
        return httpx.Response(200, json={"result": "OK"})

    transport = httpx.MockTransport(handler)
    writer = cache_module.Cache(transport=transport)
    reader = cache_module.Cache(transport=transport)

    async def scenario():
        assert writer.backend == "upstash"
        await writer.set("key", {"score": 88}, ttl=60)
        set_call = calls[-1]
        assert set_call["auth"] == "Bearer secret-token"
        assert set_call["payload"][:2] == ["SET", "key"]
        assert set_call["payload"][3] == "EX"

        assert await reader.get("key") == {"score": 88}
        await writer.close()
        await reader.close()

    asyncio.run(scenario())


def test_disabled_cache_does_nothing(monkeypatch):
    monkeypatch.setenv("CACHE_ENABLED", "false")
    cache = cache_module.Cache()

    async def scenario():
        assert cache.backend == "off"
        await cache.set("key", {"score": 1})
        assert await cache.get("key") is None
        await cache.close()

    asyncio.run(scenario())
