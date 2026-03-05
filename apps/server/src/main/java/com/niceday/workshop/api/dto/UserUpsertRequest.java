package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.NotBlank;

public record UserUpsertRequest(
        @NotBlank String name,
        @NotBlank String team,
        @NotBlank String department,
        @NotBlank String role
) {
}
