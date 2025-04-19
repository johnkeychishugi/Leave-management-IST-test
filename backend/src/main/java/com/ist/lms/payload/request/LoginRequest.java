package com.ist.lms.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String password;
    
    // Explicit getters in case Lombok is not working
    public String getEmail() {
        return email;
    }
    
    public String getPassword() {
        return password;
    }
} 