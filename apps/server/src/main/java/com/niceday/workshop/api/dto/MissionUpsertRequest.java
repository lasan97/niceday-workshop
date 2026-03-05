package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record MissionUpsertRequest(
        @NotBlank String title,
        @Min(0) int points,
        boolean active,
        @Min(0) int pendingApprovals
) {
}
