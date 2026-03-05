package com.niceday.workshop.api.dto;

public record SessionResponse(
        String id,
        String team,
        String title,
        String speaker,
        String room,
        boolean liveQa,
        int pendingQuestions
) {
}
