package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.NotBlank;

public record UserUpsertRequest(
        @NotBlank String username,
        @NotBlank String name,
        @NotBlank String team,
        String workshopTeamId,
        @NotBlank String department,
        @NotBlank String role
) {
}
