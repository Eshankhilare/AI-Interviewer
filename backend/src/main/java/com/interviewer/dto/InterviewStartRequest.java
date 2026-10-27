package com.interviewer.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InterviewStartRequest {

    @NotNull(message = "Job description ID is required")
    private Long jobDescriptionId;

    private Long resumeId;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    private String mode = "TEXT";

    @Min(value = 1, message = "At least one question is required")
    @Max(value = 30, message = "At most 30 questions are allowed")
    private Integer totalQuestions = 10;

    @Min(value = 5, message = "Duration must be at least 5 minutes")
    @Max(value = 240, message = "Duration must be at most 240 minutes")
    private Integer durationMinutes = 60;

    @Size(max = 2000, message = "Notes must be at most 2000 characters")
    private String notes;
}
