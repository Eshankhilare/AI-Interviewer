package com.interviewer.controller;

import com.interviewer.dto.JobDescriptionRequest;
import com.interviewer.dto.JobDescriptionResponse;
import com.interviewer.security.CurrentUser;
import com.interviewer.service.JobDescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-descriptions")
@RequiredArgsConstructor
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<JobDescriptionResponse> create(@Valid @RequestBody JobDescriptionRequest request) {
        return ResponseEntity.ok(jobDescriptionService.create(currentUser.id(), request));
    }

    @GetMapping
    public ResponseEntity<List<JobDescriptionResponse>> getUserJobDescriptions() {
        return ResponseEntity.ok(jobDescriptionService.getUserJobDescriptions(currentUser.id()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDescriptionResponse> getJobDescription(@PathVariable Long id) {
        return ResponseEntity.ok(jobDescriptionService.getJobDescription(id, currentUser.id()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteJobDescription(@PathVariable Long id) {
        jobDescriptionService.deleteJobDescription(id, currentUser.id());
        return ResponseEntity.ok(Map.of("message", "Job description deleted"));
    }
}
