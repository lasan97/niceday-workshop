package com.niceday.workshop.api.dto;

public record ScheduleItemResponse(
        String id,
        String startsAt,
        String endsAt,
        String title,
        String description
) {
}
