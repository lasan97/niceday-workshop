package com.niceday.workshop.auth.dto;

public record AuthMeResponse(
        String username,
        String role,
        String team
) {
}
