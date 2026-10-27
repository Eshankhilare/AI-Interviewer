package com.interviewer.controller;

import com.interviewer.service.AiServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lightweight liveness probe for Render and the keep-alive workflow.
 * Deliberately does not require authentication and does not use Actuator.
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;
    private final AiServiceClient aiServiceClient;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        boolean database = databaseReachable();
        boolean aiService = aiServiceClient.isHealthy();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", database ? "UP" : "DOWN");
        body.put("timestamp", Instant.now().toString());
        body.put("database", database ? "UP" : "DOWN");
        // The app stays usable when the AI service is down (question bank + honest fallbacks).
        body.put("aiService", aiService ? "UP" : "DOWN");

        return ResponseEntity.status(database ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    private boolean databaseReachable() {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery("SELECT 1")) {
            return result.next();
        } catch (Exception e) {
            return false;
        }
    }
}
