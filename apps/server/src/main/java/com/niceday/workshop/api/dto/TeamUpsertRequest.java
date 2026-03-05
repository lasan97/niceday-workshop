package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.NotBlank;

public record TeamUpsertRequest(
        @NotBlank String name
) {
}
