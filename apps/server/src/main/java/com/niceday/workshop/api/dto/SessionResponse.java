package com.niceday.workshop.api.dto;

public record SessionResponse(
        String id,
        String team,
        String title,
        String description,
        int runningMinutes,
        int displayOrder
) {
}
