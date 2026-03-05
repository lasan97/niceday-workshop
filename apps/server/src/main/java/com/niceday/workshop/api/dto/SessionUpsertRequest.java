package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SessionUpsertRequest(
        @NotBlank String team,
        @NotBlank String title,
        @NotBlank String speaker,
        @NotBlank String room,
        boolean liveQa,
        @Min(0) int pendingQuestions
) {
}
