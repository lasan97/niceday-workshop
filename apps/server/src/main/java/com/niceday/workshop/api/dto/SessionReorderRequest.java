package com.niceday.workshop.api.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SessionReorderRequest(
        @NotEmpty List<String> orderedIds
) {
}
