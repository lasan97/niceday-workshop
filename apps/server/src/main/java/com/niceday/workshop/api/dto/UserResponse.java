package com.niceday.workshop.api.dto;

public record UserResponse(
        String id,
        String username,
        String name,
        String team,
        String workshopTeamId,
        String workshopTeamName,
        String department,
        String role
) {
}
