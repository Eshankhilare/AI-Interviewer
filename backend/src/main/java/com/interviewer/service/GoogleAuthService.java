package com.interviewer.service;

import com.interviewer.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * Minimal Google OAuth 2.0 / OpenID Connect code flow. Enabled only when
 * GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set, so the button disappears
 * on deployments that have not configured it.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthService {

    @Value("${app.google.client-id:}")
    private String clientId;

    @Value("${app.google.client-secret:}")
    private String clientSecret;

    @Value("${app.google.redirect-uri:http://localhost:8082/api/auth/google/callback}")
    private String redirectUri;

    private final AuthService authService;
    private final RestClient restClient = RestClient.create();

    public boolean isConfigured() {
        return !clientId.isBlank() && !clientSecret.isBlank();
    }

    public String authorizationUrl(String state) {
        return UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .queryParam("state", state)
                .queryParam("prompt", "select_account")
                .build()
                .encode()
                .toUriString();
    }

    public AuthResponse exchange(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");

        @SuppressWarnings("unchecked")
        Map<String, Object> token = restClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        String accessToken = token == null ? null : (String) token.get("access_token");
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalStateException("Google token exchange returned no access token");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> profile = restClient.get()
                .uri("https://openidconnect.googleapis.com/v1/userinfo")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        if (profile == null || profile.get("email") == null) {
            throw new IllegalStateException("Google returned no email");
        }
        if (!Boolean.TRUE.equals(profile.get("email_verified"))) {
            throw new IllegalStateException("Google email is not verified");
        }

        String email = (String) profile.get("email");
        String name = (String) profile.get("name");
        log.debug("Google sign-in for {}", email);
        return authService.loginWithGoogle(email, name);
    }
}
