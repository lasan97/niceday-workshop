package com.niceday.workshop.auth.dto;

public record AuthLoginResponse(
        String role,
        String sessionToken
) {
}
