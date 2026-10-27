package com.interviewer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AnswerSubmitRequest {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotBlank(message = "Answer is required")
    @Size(max = 20000, message = "Answer must be at most 20000 characters")
    private String answer;

    @Size(max = 20000, message = "Follow-up answer must be at most 20000 characters")
    private String followUpAnswer;
}
