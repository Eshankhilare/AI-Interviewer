package com.interviewer.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EvaluationResponse {
    private Long id;
    private Integer score;
    private String grade;
    private String feedback;
    private String strengths;
    private String weaknesses;
    private String improvementSuggestions;
    private String sampleResponse;
    private String confidenceLevel;
    private String communicationScore;
    private String technicalDepth;
}
