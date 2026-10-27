package com.interviewer.controller;

import com.interviewer.service.CodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/coding")
@RequiredArgsConstructor
public class CodingController {

    private static final int MAX_SOURCE_CHARS = 50_000;

    private final CodingService codingService;

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeCode(@RequestBody Map<String, Object> request) {
        Integer languageId = (Integer) request.get("languageId");
        String sourceCode = (String) request.get("sourceCode");
        String stdin = (String) request.getOrDefault("stdin", "");

        validate(languageId, sourceCode);
        if (stdin != null && stdin.length() > MAX_SOURCE_CHARS) {
            throw new IllegalArgumentException("Input is too large");
        }

        return ResponseEntity.ok(codingService.executeCode(languageId, sourceCode, stdin));
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitCode(@RequestBody Map<String, Object> request) {
        Long problemId = request.get("problemId") != null ?
            Long.valueOf(request.get("problemId").toString()) : null;
        Integer languageId = (Integer) request.get("languageId");
        String language = (String) request.get("language");
        String sourceCode = (String) request.get("sourceCode");

        validate(languageId, sourceCode);

        return ResponseEntity.ok(codingService.submitCode(problemId, languageId, language, sourceCode));
    }

    @GetMapping("/languages")
    public ResponseEntity<Object> getSupportedLanguages() {
        return ResponseEntity.ok(codingService.getSupportedLanguages());
    }

    @GetMapping("/problems")
    public ResponseEntity<Object> getProblems() {
        return ResponseEntity.ok(codingService.getProblems());
    }

    @GetMapping("/problems/{id}")
    public ResponseEntity<Object> getProblem(@PathVariable Long id) {
        return ResponseEntity.ok(codingService.getProblem(id));
    }

    private void validate(Integer languageId, String sourceCode) {
        if (languageId == null) {
            throw new IllegalArgumentException("languageId is required");
        }
        if (sourceCode == null || sourceCode.isBlank()) {
            throw new IllegalArgumentException("sourceCode is required");
        }
        if (sourceCode.length() > MAX_SOURCE_CHARS) {
            throw new IllegalArgumentException("Source code is too large");
        }
    }
}
