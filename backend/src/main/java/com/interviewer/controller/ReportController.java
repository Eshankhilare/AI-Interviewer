package com.interviewer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewer.dto.ReportResponse;
import com.interviewer.entity.Interview;
import com.interviewer.entity.Report;
import com.interviewer.exception.ConflictException;
import com.interviewer.exception.ResourceNotFoundException;
import com.interviewer.repository.InterviewRepository;
import com.interviewer.repository.ReportRepository;
import com.interviewer.security.CurrentUser;
import com.interviewer.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewService interviewService;
    private final CurrentUser currentUser;
    private final ObjectMapper objectMapper;

    @GetMapping("/{interviewId}")
    public ResponseEntity<ReportResponse> getReportByInterviewId(@PathVariable Long interviewId) {
        Report report = requireReport(interviewId);
        return ResponseEntity.ok(toResponse(report));
    }

    @GetMapping("/{interviewId}/full")
    public ResponseEntity<Map<String, Object>> getFullReport(@PathVariable Long interviewId) {
        Report report = requireReport(interviewId);

        Map<String, Object> fullReport = new HashMap<>();
        fullReport.put("id", report.getId());
        fullReport.put("interviewId", report.getInterview().getId());
        fullReport.put("overallScore", report.getOverallScore());
        fullReport.put("overallGrade", report.getOverallGrade());
        fullReport.put("summary", report.getSummary());
        fullReport.put("skillRadarData", parseJson(report.getSkillRadarData()));
        fullReport.put("categoryScores", parseJson(report.getCategoryScores()));
        fullReport.put("strengths", parseJson(report.getStrengths()));
        fullReport.put("weaknesses", parseJson(report.getWeaknesses()));
        fullReport.put("recommendations", report.getRecommendations());
        fullReport.put("recommendationLevel", report.getRecommendationLevel());
        fullReport.put("questionBreakdown", parseJson(report.getQuestionBreakdown()));
        fullReport.put("createdAt", report.getCreatedAt());

        return ResponseEntity.ok(fullReport);
    }

    /** A report is visible only to the interview owner and only once the interview is completed. */
    private Report requireReport(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        if (!interview.getCandidate().getId().equals(currentUser.id())) {
            throw new ResourceNotFoundException("Interview not found");
        }

        Report report = reportRepository.findByInterviewId(interviewId).orElse(null);
        if (report != null) {
            return report;
        }
        if (interview.getStatus() != Interview.Status.COMPLETED) {
            throw new ConflictException("The report is available after the interview is completed");
        }
        return interviewService.generateReportForInterview(interview);
    }

    private ReportResponse toResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .interviewId(report.getInterview().getId())
                .overallScore(report.getOverallScore())
                .overallGrade(report.getOverallGrade())
                .summary(report.getSummary())
                .skillRadarData(parseJson(report.getSkillRadarData()))
                .categoryScores(parseJson(report.getCategoryScores()))
                .strengths(parseJson(report.getStrengths()))
                .weaknesses(parseJson(report.getWeaknesses()))
                .recommendations(report.getRecommendations())
                .recommendationLevel(report.getRecommendationLevel())
                .questionBreakdown(parseJson(report.getQuestionBreakdown()))
                .createdAt(report.getCreatedAt())
                .build();
    }

    private Object parseJson(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(raw, Object.class);
        } catch (Exception e) {
            return List.of();
        }
    }
}
