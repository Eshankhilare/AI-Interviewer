package com.interviewer.controller;

import com.interviewer.dto.*;
import com.interviewer.security.CurrentUser;
import com.interviewer.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final CurrentUser currentUser;

    @PostMapping("/start")
    public ResponseEntity<InterviewResponse> startInterview(@Valid @RequestBody InterviewStartRequest request) {
        return ResponseEntity.ok(interviewService.startInterview(currentUser.id(), request));
    }

    @PostMapping("/{interviewId}/begin")
    public ResponseEntity<InterviewResponse> beginInterview(@PathVariable Long interviewId) {
        return ResponseEntity.ok(interviewService.startInterviewSession(interviewId, currentUser.id()));
    }

    @GetMapping("/{interviewId}/next-question")
    public ResponseEntity<SessionResponse> getNextQuestion(@PathVariable Long interviewId) {
        return ResponseEntity.ok(interviewService.getNextQuestion(interviewId, currentUser.id()));
    }

    @PostMapping("/{interviewId}/answer")
    public ResponseEntity<SessionResponse> submitAnswer(
            @PathVariable Long interviewId,
            @Valid @RequestBody AnswerSubmitRequest request) {
        return ResponseEntity.ok(interviewService.submitAnswer(interviewId, currentUser.id(), request));
    }

    @PostMapping("/{interviewId}/end")
    public ResponseEntity<InterviewResponse> endInterview(@PathVariable Long interviewId) {
        return ResponseEntity.ok(interviewService.endInterview(interviewId, currentUser.id()));
    }

    @GetMapping
    public ResponseEntity<List<InterviewResponse>> getUserInterviews() {
        return ResponseEntity.ok(interviewService.getUserInterviews(currentUser.id()));
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<InterviewResponse> getInterview(@PathVariable Long interviewId) {
        return ResponseEntity.ok(interviewService.getInterview(interviewId, currentUser.id()));
    }
}
