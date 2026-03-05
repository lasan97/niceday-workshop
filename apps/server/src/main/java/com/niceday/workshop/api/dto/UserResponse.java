package com.niceday.workshop.api.dto;

public record UserResponse(
        String id,
        String name,
        String team,
        String department,
        String role
) {
}
