package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.NotBlank;

public record ScheduleUpsertRequest(
        @NotBlank String startsAt,
        @NotBlank String endsAt,
        @NotBlank String title,
        @NotBlank String description
) {
}
