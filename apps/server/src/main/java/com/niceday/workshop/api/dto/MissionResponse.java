package com.niceday.workshop.api.dto;

public record MissionResponse(
        String id,
        String title,
        int points,
        boolean active,
        int pendingApprovals
) {
}
