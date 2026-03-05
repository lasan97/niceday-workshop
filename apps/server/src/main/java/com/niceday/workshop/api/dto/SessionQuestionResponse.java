package com.niceday.workshop.api.dto;

public record SessionQuestionResponse(
        String id,
        String sessionId,
        String question,
        String answer,
        long createdAt
) {
}
