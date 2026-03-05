package com.niceday.workshop.api.dto;

public record ScheduleItemResponse(
        String id,
        String day,
        String startsAt,
        String endsAt,
        String title,
        String location
) {
}
