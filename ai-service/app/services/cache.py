import hashlib
import json
import logging
import os
import time
from typing import Any, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger(__name__)

# Upstash Redis over its REST API. httpx is already a dependency, so no new
# package is needed. When the two env vars are absent the cache still works as
# an in-process TTL cache; when Upstash is configured it becomes shared across
# workers/restarts. Every operation fails open: a cache outage must never fail
# an interview request.

DEFAULT_TTL = int(os.getenv("CACHE_TTL_SECONDS", str(7 * 24 * 60 * 60)))


class Cache:
    def __init__(self, transport: Optional[httpx.AsyncBaseTransport] = None):
        self.url = (os.getenv("UPSTASH_REDIS_REST_URL") or "").rstrip("/")
        self.token = os.getenv("UPSTASH_REDIS_REST_TOKEN") or ""
        self.enabled = os.getenv("CACHE_ENABLED", "true").strip().lower() not in {"0", "false", "off"}
        self._memory: dict[str, tuple[float, Any]] = {}
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(2.0),
            transport=transport,
            headers={"Authorization": f"Bearer {self.token}"} if self.token else {},
        )

    @property
    def backend(self) -> str:
        if not self.enabled:
            return "off"
        return "upstash" if self.url and self.token else "memory"

    @staticmethod
    def key(namespace: str, *parts: Any) -> str:
        payload = json.dumps([namespace, *parts], sort_keys=True, ensure_ascii=False, default=str)
        digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:40]
        return f"ai-interviewer:{namespace}:{digest}"

    async def get(self, key: str) -> Optional[Any]:
        if not self.enabled:
            return None

        entry = self._memory.get(key)
        if entry and entry[0] > time.monotonic():
            return entry[1]

        if self.backend != "upstash":
            return None

        try:
            response = await self._client.post(self.url, json=["GET", key])
            response.raise_for_status()
            result = response.json().get("result")
            if result:
                value = json.loads(result)
                self._remember(key, value)
                return value
        except Exception as exc:  # noqa: BLE001 - fail open by design
            log.debug("upstash get failed: %s", exc)
        return None

    async def set(self, key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
        if not self.enabled:
            return

        self._remember(key, value, ttl)

        if self.backend != "upstash":
            return

        try:
            payload = json.dumps(value, ensure_ascii=False, default=str)
            command = ["SET", key, payload, "EX", max(1, int(ttl))]
            response = await self._client.post(self.url, json=command)
            response.raise_for_status()
        except Exception as exc:  # noqa: BLE001 - fail open by design
            log.debug("upstash set failed: %s", exc)

    def _remember(self, key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
        if len(self._memory) > 500:
            now = time.monotonic()
            self._memory = {k: v for k, v in self._memory.items() if v[0] > now}
        self._memory[key] = (time.monotonic() + max(1, int(ttl)), value)

    async def close(self) -> None:
        await self._client.aclose()


cache = Cache()
