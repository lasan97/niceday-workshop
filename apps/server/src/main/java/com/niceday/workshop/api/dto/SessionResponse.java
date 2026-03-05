package com.niceday.workshop.api.dto;

public record SessionResponse(
        String id,
        String workshopTeamId,
        String workshopTeamName,
        String title,
        String description,
        int runningMinutes,
        int displayOrder
) {
}
