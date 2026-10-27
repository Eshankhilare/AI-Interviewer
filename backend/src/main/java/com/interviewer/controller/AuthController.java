package com.interviewer.controller;

import com.interviewer.dto.AuthResponse;
import com.interviewer.dto.LoginRequest;
import com.interviewer.dto.RegisterRequest;
import com.interviewer.service.AuthService;
import com.interviewer.service.GoogleAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.google.redirect-uri:http://localhost:8082/api/auth/google/callback}")
    private String googleRedirectUri;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** Which social providers are configured, so the UI can hide dead buttons. */
    @GetMapping("/providers")
    public ResponseEntity<Map<String, Boolean>> providers() {
        return ResponseEntity.ok(Map.of("google", googleAuthService.isConfigured()));
    }

    @GetMapping("/google")
    public ResponseEntity<Void> google() {
        if (!googleAuthService.isConfigured()) {
            return redirect(frontend() + "/login?error=google_not_configured", null);
        }
        String state = randomState();
        ResponseCookie cookie = ResponseCookie.from("g_state", state)
                .httpOnly(true)
                .secure(googleRedirectUri.startsWith("https://"))
                .sameSite("Lax")
                .path("/api/auth/google")
                .maxAge(Duration.ofMinutes(10))
                .build();
        return redirect(googleAuthService.authorizationUrl(state), cookie);
    }

    @GetMapping("/google/callback")
    public ResponseEntity<Void> googleCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            @CookieValue(value = "g_state", required = false) String stateCookie) {

        boolean validState = state != null && stateCookie != null
                && MessageDigest.isEqual(state.getBytes(StandardCharsets.UTF_8),
                                         stateCookie.getBytes(StandardCharsets.UTF_8));

        String target;
        if (error == null && code != null && validState) {
            try {
                AuthResponse auth = googleAuthService.exchange(code);
                // Fragment keeps the JWT out of server logs and Referer headers.
                target = frontend() + "/auth/callback#token="
                        + URLEncoder.encode(auth.getToken(), StandardCharsets.UTF_8);
            } catch (Exception ex) {
                log.warn("Google sign-in failed: {}", ex.getMessage());
                target = frontend() + "/login?error=google_failed";
            }
        } else {
            target = frontend() + "/login?error=google_failed";
        }

        ResponseCookie clear = ResponseCookie.from("g_state", "")
                .path("/api/auth/google").maxAge(0).build();
        return redirect(target, clear);
    }

    private String frontend() {
        return frontendUrl.replaceAll("/+$", "");
    }

    private static String randomState() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static ResponseEntity<Void> redirect(String location, ResponseCookie cookie) {
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(302).location(URI.create(location));
        if (cookie != null) {
            builder.header(HttpHeaders.SET_COOKIE, cookie.toString());
        }
        return builder.build();
    }
}
