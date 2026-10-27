package com.interviewer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email or phone is required")
    @Size(max = 100, message = "Email or phone is too long")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
