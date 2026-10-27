package com.interviewer.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window limiter for the credential endpoints. It is deliberately in-memory:
 * one instance per backend, which is enough to stop password spraying against the
 * demo deployment. A shared store would be needed behind multiple instances.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> LIMITED_PATHS = Set.of("/api/auth/login", "/api/auth/register");
    private static final long WINDOW_MS = 60_000;

    private final boolean enabled;
    private final int maxPerMinute;
    private final Map<String, long[]> windows = new ConcurrentHashMap<>();

    public AuthRateLimitFilter(@Value("${app.rate-limit.enabled:true}") boolean enabled,
                               @Value("${app.rate-limit.max-requests-per-minute:60}") int maxPerMinute) {
        this.enabled = enabled;
        this.maxPerMinute = maxPerMinute;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !enabled || !LIMITED_PATHS.contains(request.getRequestURI());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String key = clientIp(request) + ':' + request.getRequestURI();
        long now = System.currentTimeMillis();
        long[] window = windows.computeIfAbsent(key, ignored -> new long[]{now, 0});

        synchronized (window) {
            if (now - window[0] >= WINDOW_MS) {
                window[0] = now;
                window[1] = 0;
            }
            window[1]++;
            if (window[1] > maxPerMinute) {
                response.setStatus(429);
                response.setHeader("Retry-After", "60");
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many attempts. Try again in a minute.\"}");
                return;
            }
        }

        // shortcut: crude cap on the map; swap for a TTL cache if traffic ever justifies it.
        if (windows.size() > 10_000) {
            windows.clear();
        }
        chain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
