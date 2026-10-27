package com.interviewer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private Long interviewId;
    private Integer overallScore;
    private String overallGrade;
    private String summary;
    private Object skillRadarData;
    private Object categoryScores;
    private Object strengths;
    private Object weaknesses;
    private String recommendations;
    private String recommendationLevel;
    private Object questionBreakdown;
    private LocalDateTime createdAt;
}
